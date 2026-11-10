"""Use fake flash files only; these tests never open a COM port."""
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('vision_flash', ROOT / 'tools' / 'flash.py')
flash = importlib.util.module_from_spec(spec)
spec.loader.exec_module(flash)


def make_backup(tmp_path, matching_partition=True):
    path = tmp_path / 'original.bin'
    data = bytearray([255]) * flash.SIZE
    partition = (ROOT / 'release' / 'partitions.bin').read_bytes()
    data[0x8000:0x8000 + len(partition)] = partition
    if not matching_partition:
        data[0x8000] ^= 1
    path.write_bytes(data)
    path.with_suffix('.json').write_text(json.dumps({
        'format': 'vision-drive-backup-v1', 'mac': 'aa:bb:cc:dd:ee:ff',
        'size': len(data), 'sha256': hashlib.sha256(data).hexdigest()}))
    return path


def invoke(monkeypatch, backup, calls, suffix='FFEE'):
    monkeypatch.setattr(sys, 'argv', ['flash', 'install', '--port', 'MOCK-NEVER-OPEN',
                                     '--backup', str(backup), '--confirm', 'INSTALL',
                                     '--expected-ssid-suffix', suffix])
    monkeypatch.setattr(flash, 'mac', lambda port: 'aa:bb:cc:dd:ee:ff')
    monkeypatch.setattr(flash, 'run', lambda port, *args: calls.append(args))
    flash.main()


def test_app_only_write_preserves_other_partitions(monkeypatch, tmp_path):
    calls = []
    invoke(monkeypatch, make_backup(tmp_path), calls)
    assert [call[0] for call in calls] == ['write_flash', 'verify_flash']
    assert calls[0][-2] == '0x10000'
    assert calls[1][-2] == '0x10000'
    assert calls[0][-1].name == 'firmware.bin'


def test_wrong_partition_or_corrupt_backup_cannot_write(monkeypatch, tmp_path):
    calls = []
    backup = make_backup(tmp_path, matching_partition=False)
    with pytest.raises(RuntimeError, match='partition layout'):
        invoke(monkeypatch, backup, calls)
    assert calls == []
    backup.write_bytes(backup.read_bytes()[:-1] + b'0')
    with pytest.raises(RuntimeError, match='Backup size, MAC or SHA-256'):
        invoke(monkeypatch, backup, calls)
    assert calls == []


def test_unrelated_esp_cannot_be_selected(monkeypatch, tmp_path):
    calls = []
    with pytest.raises(RuntimeError, match='Board MAC does not match'):
        invoke(monkeypatch, make_backup(tmp_path), calls, suffix='FFFF')
    assert calls == []


def test_restore_requires_confirmation_and_verifies_full_backup(monkeypatch, tmp_path):
    backup = make_backup(tmp_path)
    calls = []
    monkeypatch.setattr(flash, 'mac', lambda port: 'aa:bb:cc:dd:ee:ff')
    monkeypatch.setattr(flash, 'run', lambda port, *args: calls.append(args))
    args = ['flash', 'restore', '--port', 'MOCK-NEVER-OPEN', '--backup', str(backup)]
    monkeypatch.setattr(sys, 'argv', args)
    with pytest.raises(RuntimeError, match='Explicit --confirm INSTALL or RESTORE'):
        flash.main()
    assert calls == []

    monkeypatch.setattr(sys, 'argv', args + ['--confirm', 'RESTORE'])
    flash.main()
    assert [call[0] for call in calls] == ['write_flash', 'verify_flash']
    assert [call[-2] for call in calls] == ['0', '0']
    assert all(call[-1] == backup for call in calls)


def test_restore_rejects_corrupt_backup_before_writing(monkeypatch, tmp_path):
    backup = make_backup(tmp_path)
    backup.write_bytes(backup.read_bytes()[:-1] + b'0')
    calls = []
    monkeypatch.setattr(flash, 'mac', lambda port: 'aa:bb:cc:dd:ee:ff')
    monkeypatch.setattr(flash, 'run', lambda port, *args: calls.append(args))
    monkeypatch.setattr(sys, 'argv', ['flash', 'restore', '--port', 'MOCK-NEVER-OPEN',
                                     '--backup', str(backup), '--confirm', 'RESTORE'])
    with pytest.raises(RuntimeError, match='Backup size, MAC or SHA-256'):
        flash.main()
    assert calls == []
