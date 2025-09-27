// example/invokeFromUI.js
// How the React cockpit or FleetGenAPI should submit tasks to FleetCore1000 API.

const fetch = require('node-fetch');
async function submitSimulateTask(agents, env) {
  const r = await fetch('http://localhost:4001/api/task', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'simulate', priority: 8, payload: { agents, env, steps: 40, rollouts: 100 } })
  });
  return r.json();
}

async function submitMentorMatch(mentees, mentors) {
  const r = await fetch('http://localhost:4001/api/task', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'mentorMatch', priority: 9, payload: { mentees, mentors } })
  });
  return r.json();
}