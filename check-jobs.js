async function run() {
  const runsRes = await fetch('https://api.github.com/repos/aerotechnologiesstore/aerotechnologiesstore.github.io/actions/runs?per_page=1');
  const runsData = await runsRes.json();
  const runId = runsData.workflow_runs[0].id;
  
  const jobsRes = await fetch(`https://api.github.com/repos/aerotechnologiesstore/aerotechnologiesstore.github.io/actions/runs/${runId}/jobs`);
  const jobsData = await jobsRes.json();
  
  jobsData.jobs.forEach(job => {
    console.log('Job:', job.name, 'Conclusion:', job.conclusion);
    job.steps.forEach(step => {
      if (step.conclusion !== 'success' && step.conclusion !== 'skipped') {
        console.log('  Step failed:', step.name, 'Conclusion:', step.conclusion);
      }
    });
  });
}
run();
