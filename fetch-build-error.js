async function run() {
  const runsRes = await fetch('https://api.github.com/repos/aerotechnologiesstore/aerotechnologiesstore.github.io/actions/runs?per_page=1');
  const runsData = await runsRes.json();
  const runId = runsData.workflow_runs[0].id;
  
  const jobsRes = await fetch(`https://api.github.com/repos/aerotechnologiesstore/aerotechnologiesstore.github.io/actions/runs/${runId}/jobs`);
  const jobsData = await jobsRes.json();
  const jobId = jobsData.jobs[0].id;
  
  const logRes = await fetch(`https://api.github.com/repos/aerotechnologiesstore/aerotechnologiesstore.github.io/actions/jobs/${jobId}/logs`);
  const logText = await logRes.text();
  
  const lines = logText.split('\n');
  const buildIndex = lines.findIndex(l => l.includes('npm run build'));
  if (buildIndex !== -1) {
    console.log(lines.slice(buildIndex, buildIndex + 50).join('\n'));
  }
}
run();
