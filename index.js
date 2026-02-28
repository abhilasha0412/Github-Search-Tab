const API="https://api.github.com/users/";

const main=document.getElementById("main");
const form=document.getElementById("userInput");
const search=document.getElementById("inputBox");
const toggle=document.getElementById("toggle");
const historyList=document.getElementById("historyList");
const suggestions=document.getElementById("suggestions");

let chart;

function loading(){
main.innerHTML=`<div class="card">Loading profile...</div>`;
}

async function getUser(username){

loading();

try{

const {data}=await axios(API+username);

createUserCard(data);

saveHistory(username);

getRepos(username);

}
catch{

main.innerHTML=`<div class="card">User not found</div>`;

}

}

async function getRepos(username){

try{

const {data}=await axios(API+username+"/repos");

addRepos(data);

createChart(data);

}
catch{

console.log("repo error");

}

}

function createUserCard(user){

main.innerHTML=

`
<div class="card">

<img src="${user.avatar_url}" class="avatar">

<div class="user-info">

<h2>${user.name || user.login}</h2>

<p>${user.bio || ""}</p>

<p><b>Location:</b> ${user.location || "N/A"}</p>

<p><b>Company:</b> ${user.company || "N/A"}</p>

<ul>

<li>${user.followers} Followers</li>

<li>${user.following} Following</li>

<li>${user.public_repos} Repos</li>

</ul>

<a href="${user.html_url}" target="_blank" class="profileBtn">
Visit Profile
</a>

<div id="repos"></div>

</div>

</div>
`;

}

function addRepos(repos){

const repoBox=document.getElementById("repos");

repos
.sort((a,b)=>b.stargazers_count-a.stargazers_count)
.slice(0,5)
.forEach(repo=>{

let a=document.createElement("a");

a.className="repo";

a.href=repo.html_url;

a.target="_blank";

a.innerText=repo.name+" ⭐"+repo.stargazers_count;

repoBox.appendChild(a);

});

}

function createChart(repos){

let languages={};

repos.forEach(r=>{

if(r.language){
languages[r.language]=(languages[r.language]||0)+1;
}

});

const ctx=document.getElementById("languageChart");

if(chart){
chart.destroy();
}

chart=new Chart(ctx,{
type:"pie",
data:{
labels:Object.keys(languages),
datasets:[{
data:Object.values(languages)
}]
}
});

}

form.addEventListener("submit",e=>{

e.preventDefault();

let user=search.value.trim();

if(user){

getUser(user);

search.value="";

}

});

function saveHistory(name){

let history=JSON.parse(localStorage.getItem("history"))||[];

history=history.filter(h=>h!==name);

history.unshift(name);

history=history.slice(0,5);

localStorage.setItem("history",JSON.stringify(history));

showHistory();

}

function showHistory(){

historyList.innerHTML="";

let history=JSON.parse(localStorage.getItem("history"))||[];

history.forEach(user=>{

let li=document.createElement("li");

li.innerText=user;

li.onclick=()=>getUser(user);

historyList.appendChild(li);

});

}

search.addEventListener("keyup",async()=>{

let value=search.value;

if(value.length<2){

suggestions.innerHTML="";
return;

}

const res=await axios(`https://api.github.com/search/users?q=${value}`);

suggestions.innerHTML="";

res.data.items.slice(0,5).forEach(u=>{

let li=document.createElement("li");

li.innerText=u.login;

li.onclick=()=>{

search.value=u.login;

suggestions.innerHTML="";

};

suggestions.appendChild(li);

});

});

if(localStorage.getItem("theme")==="light"){
document.body.classList.remove("dark");
toggle.innerText="Dark Mode";
}

toggle.onclick=()=>{

document.body.classList.toggle("dark");

if(document.body.classList.contains("dark")){

localStorage.setItem("theme","dark");

toggle.innerText="Light Mode";

}else{

localStorage.setItem("theme","light");

toggle.innerText="Dark Mode";

}

};

showHistory();
