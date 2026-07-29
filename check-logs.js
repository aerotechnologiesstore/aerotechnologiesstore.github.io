async function run() {
  const runsRes = await fetch('https://api.github.com/repos/aerotechnologiesstore/aerotechnologiesstore.github.io/actions/runs');
  const runsData = await runsRes.json();
  const runId = runsData.workflow_runs[0].id;
  
  const jobsRes = await fetch(`https://api.github.com/repos/aerotechnologiesstore/aerotechnologiesstore.github.io/actions/runs/${runId}/jobs`);
  const jobsData = await jobsRes.json();
  const jobId = jobsData.jobs[0].id;
  
  const logRes = await fetch(`https://api.github.com/repos/aerotechnologiesstore/aerotechnologiesstore.github.io/actions/jobs/${jobId}/logs`);
  const logText = await logRes.text();
  
  const lines = logText.split('\n');
  lines.forEach((line, i) => {
    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')) {
      console.log(lines.slice(Math.max(0, i - 2), i + 3).join('\n'));
      console.log('---');
    }
  });
}
run();
