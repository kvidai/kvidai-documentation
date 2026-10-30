// In-process status includes webServer startup, before any test can begin.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
export default class DocumentationStartupStatusReporter {
  state = { state: 'running', phase: 'server-startup', pid: process.pid, cases: [], errors: [] };
  constructor() {
    this.filename = path.resolve('playwright/.cache', `startup-status-${process.pid}.json`);
    this.write();
    this.timer = setInterval(() => this.write(), 2000);
    this.timer.unref();
  }
  write() {
    mkdirSync(path.dirname(this.filename), { recursive: true });
    writeFileSync(this.filename, JSON.stringify({ ...this.state, updatedAt: new Date().toISOString() }, null, 2));
  }
  onBegin() { this.state.phase = 'tests'; this.write(); }
  onTestBegin(test) { this.state.activeTest = test.title; this.write(); }
  onTestEnd(test, result) {
    this.state.cases.push({ title: test.title, status: result.status, durationMs: result.duration, errors: result.errors.map(error => error.message) });
    this.write();
  }
  onError(error) { this.state.errors.push(error.message); this.write(); }
  onEnd(result) {
    clearInterval(this.timer); this.state.state = result.status; this.state.phase = 'finished'; delete this.state.activeTest; this.write();
  }
}
