#!/usr/bin/env node
"use strict";
/** OBJECT LAB: cloud-portable UI logic regression using synthetic fixtures, NEVER real responses.
    Run: node object-lab/apparel/first-drop/verify_drop_validation.js
    Requires only Node.js. This is NOT full browser-rendering verification. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const html=fs.readFileSync(path.join(__dirname,"DROP-VALIDATION-PORTABLE.html"),"utf8");
const chunks=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
assert.equal(chunks.length,1,"Exactly one executable script expected");
const js=chunks[0][1],els=new Map(),saved=new Map();
function element(id){if(!els.has(id))els.set(id,{value:"",innerHTML:"",textContent:"",disabled:false,attrs:{},setAttribute(k,v){this.attrs[k]=v}});return els.get(id)}
const choiceCards=["01","04A","04B"].map(id=>({dataset:{id},attrs:{},setAttribute(k,v){this.attrs[k]=v}}));
const document={getElementById:element,querySelectorAll:selector=>selector==="[data-id]"?choiceCards:[]};
const localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v))};
const app=new Function("document","localStorage","console","confirm",js+";return {selectDesign,chooseRating,vote,nextRespondent,saveCosts,calc};")(document,localStorage,console,()=>true);
assert.equal(element("count").textContent,0,"No real votes seeded into the dashboard");
assert.equal(element("profit").textContent,"미확인","No invented vendor prices at startup");
app.selectDesign("04A");app.chooseRating(5);app.vote();app.vote();
const votes=JSON.parse(saved.get("tohesar_firstdrop_validation_v1"));
assert.equal(votes.length,1,"A second click must not duplicate the same test respondent");
assert.deepEqual(votes[0],{product:"04A",score:5});
assert.equal(element("positive").textContent,"100%");
assert.equal(element("leader").textContent,"MONOLITH");
app.nextRespondent();
assert.equal(element("submitVote").disabled,true);
assert.ok(choiceCards.every(card=>card.attrs["aria-pressed"]==="false"));
const fixture={sale:40000,blank:15000,print:5000,trim:1000,pack:500,shipping:3000,fees:1500,other:1000,fixed:30000};
for(const [k,v] of Object.entries(fixture))element("cost-"+k).value=String(v);
element("quoteEvidence").value="SYNTHETIC QA ONLY - NOT A VENDOR QUOTE";
app.saveCosts();
assert.equal(element("variableCost").textContent,"27,000원");
assert.equal(element("profit").textContent,"13,000원");
assert.equal(element("breakEven").textContent,"3장");
console.log(JSON.stringify({status:"PASS",checks:["empty initial data","single response no double submit","4-5 score share","winner calculation","next respondent reset","direct cost 27000KRW","contribution 13000KRW","fixed cost recovery 3 units"],syntheticDataOnly:true,externalDataSent:false,realResponsesSaved:0},null,2));
