# Submission Checklist

## Code
- [ ] NestJS project builds successfully
- [ ] SQLite configuration works locally
- [ ] All modules are wired correctly
- [ ] Batch sync endpoint works
- [ ] Realtime sync endpoint works
- [ ] Time-off request create works
- [ ] Approve flow works
- [ ] Reject flow works
- [ ] Cancel flow works
- [ ] Idempotency behavior works
- [ ] Audit events are recorded

## Documentation
- [ ] `TRD.md` added
- [ ] `TEST_PLAN.md` added
- [ ] `README.md` updated with setup steps
- [ ] API endpoints documented
- [ ] assumptions documented

## Testing
- [ ] manual API verification completed
- [ ] unit test scenarios identified
- [ ] integration/e2e scenarios identified
- [ ] regression risks documented

## Repo Hygiene
- [ ] `.gitignore` excludes sqlite db and node_modules
- [ ] no unnecessary generated files committed
- [ ] clean folder structure
- [ ] meaningful commit history if possible

## Final Review
- [ ] app starts with `npm run start:dev`
- [ ] key flows re-tested before submission
- [ ] deliverables ready:
  - [ ] code repo
  - [ ] TRD
  - [ ] test plan