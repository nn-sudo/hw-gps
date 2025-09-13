// Simple client-side site: loads data/cars.json and data/gps.json

async function loadData() {
  const [carsRes, gpsRes] = await Promise.all([
    fetch('data/cars.json'),
    fetch('data/gps.json')
  ]);
  const cars = await carsRes.json();
  const gps = await gpsRes.json();
  return { cars, gps };
}

function $(sel){return document.querySelector(sel)}

function renderGallery(cars){
  const g = $('#gallery'); g.innerHTML='';
  cars.forEach(c => {
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `
      <img src="${c.image}" alt="${c.name}" />
      <h4>${c.name}</h4>
      <p>${c.model || ''}</p>
    `;
    g.appendChild(el);
  });
}

function renderGPList(gps, cars){
  const container = $('#gp-list'); container.innerHTML='';
  gps.forEach(g => {
    const div = document.createElement('div'); div.className='gp-item';
    div.innerHTML = `
      <h3>${g.name} — ${g.date}</h3>
      <p>${g.location || ''}</p>
      <button data-gp='${g.id}' class='view-gp'>View details</button>
    `;
    container.appendChild(div);
  });

  // attach handlers
  document.querySelectorAll('.view-gp').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-gp');
      const gp = gps.find(x=>x.id==id);
      showGPModal(gp, cars);
    });
  });
}

function showGPModal(gp, cars){
  const body = $('#modal-body');
  body.innerHTML = `<h3>${gp.name} — ${gp.date}</h3>`;
  const table = document.createElement('div');
  table.innerHTML = '<h4>Results</h4>' + gp.results.map(r => {
    const car = cars.find(c=>c.id==r.car_id) || {name:'Unknown'};
    return `<div>${r.position}. ${car.name} (${r.driver || ''}) — time: ${r.time || ''}</div>`;
  }).join('');
  body.appendChild(table);
  $('#modal').classList.remove('hidden');
}

function renderLeaderboard(gps, cars){
  // Simple scoring: 1st=25,2nd=18,3rd=15,4th=12,5th=10,6th=8,7th=6,8th=4,9th=2,10th=1
  const pointsMap = {1:25,2:18,3:15,4:12,5:10,6:8,7:6,8:4,9:2,10:1};
  const scores = {};
  cars.forEach(c=>scores[c.id]={car:c,points:0,wins:0,podiums:0,races:0});

  gps.forEach(g=>{
    g.results.forEach(res=>{
      if(!scores[res.car_id]) return;
      scores[res.car_id].races++;
      const pts = pointsMap[res.position] || 0;
      scores[res.car_id].points += pts;
      if(res.position===1) scores[res.car_id].wins++;
      if(res.position<=3) scores[res.car_id].podiums++;
    })
  });

  const arr = Object.values(scores).sort((a,b)=>b.points-a.points);
  const container = $('#leaderboard'); container.innerHTML='';
  arr.forEach((s,i)=>{
    const el = document.createElement('div'); el.className='leader';
    el.innerHTML = `<div><strong>#${i+1}</strong></div>
      <div style="flex:1">
        <div>${s.car.name}</div>
        <div style="font-size:12px">Points: ${s.points} • Wins: ${s.wins} • Podiums: ${s.podiums} • Races: ${s.races}</div>
      </div>`;
    container.appendChild(el);
  })
}

window.addEventListener('DOMContentLoaded', async()=>{
  const {cars,gps} = await loadData();
  renderGallery(cars);
  renderGPList(gps,cars);
  renderLeaderboard(gps,cars);

  $('#modal-close').addEventListener('click', ()=>$('#modal').classList.add('hidden'));
});
