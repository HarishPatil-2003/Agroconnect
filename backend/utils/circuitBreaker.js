/**
 * Production-Grade Circuit Breaker Pattern Utility
 * 
 * Protects application threads & DB connection pools against slow/failing external dependencies.
 * States:
 *  - CLOSED: Normal operation. All calls allowed.
 *  - OPEN: Dependency degraded/failing. Fast-fails immediately or executes fallback.
 *  - HALF_OPEN: Trial mode after cooldown. Tests if dependency has recovered.
 */

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeoutMs = options.resetTimeoutMs || 15000; // 15s cooldown before trial
    this.timeoutMs = Number(process.env.CIRCUIT_BREAKER_TIMEOUT_MS) || options.timeoutMs || 30000;
    this.maxConcurrency = options.maxConcurrency || 5;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastStateChange = Date.now();
    this.activeRequests = 0;
  }

  async execute(actionFn, fallbackFn = null) {
    const now = Date.now();

    // Check if OPEN state cooldown has expired -> switch to HALF_OPEN
    if (this.state === 'OPEN') {
      if (now - this.lastStateChange >= this.resetTimeoutMs) {
        this.transitionTo('HALF_OPEN');
      } else {
        console.warn(`⚡ [CIRCUIT BREAKER: ${this.name}] Fast-failing in OPEN state (Cooling down for ${Math.round((this.resetTimeoutMs - (now - this.lastStateChange)) / 1000)}s)`);
        if (typeof fallbackFn === 'function') {
          return await fallbackFn(new Error(`CircuitBreaker [${this.name}] is OPEN`));
        }
        throw new Error(`Service [${this.name}] is currently unavailable (Circuit Breaker OPEN).`);
      }
    }

    // Limit concurrency to prevent thread pool exhaustion
    if (this.activeRequests >= this.maxConcurrency) {
      console.warn(`⚡ [CIRCUIT BREAKER: ${this.name}] Concurrency limit exceeded (${this.activeRequests}/${this.maxConcurrency}). Fast-failing.`);
      if (typeof fallbackFn === 'function') {
        return await fallbackFn(new Error(`CircuitBreaker [${this.name}] concurrency limit reached`));
      }
      throw new Error(`Service [${this.name}] concurrency limit exceeded.`);
    }

    this.activeRequests++;

    try {
      // Wrap action in a strict timeout
      const result = await Promise.race([
        actionFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`CircuitBreaker [${this.name}] call timed out after ${this.timeoutMs}ms`)), this.timeoutMs)
        )
      ]);

      this.onSuccess();
      return result;
    } catch (err) {
      return await this.onFailure(err, fallbackFn);
    } finally {
      this.activeRequests--;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      console.log(`✅ [CIRCUIT BREAKER: ${this.name}] Recovery successful! Transitioning back to CLOSED.`);
      this.transitionTo('CLOSED');
    }
  }

  async onFailure(err, fallbackFn) {
    this.failureCount++;
    console.error(`⚠️ [CIRCUIT BREAKER: ${this.name}] Failure (${this.failureCount}/${this.failureThreshold}): ${err.message}`);

    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN');
    }

    if (typeof fallbackFn === 'function') {
      return await fallbackFn(err);
    }

    throw err;
  }

  transitionTo(newState) {
    console.log(`🔀 [CIRCUIT BREAKER: ${this.name}] State change: ${this.state} -> ${newState}`);
    this.state = newState;
    this.lastStateChange = Date.now();
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      activeRequests: this.activeRequests,
      lastStateChange: new Date(this.lastStateChange).toISOString()
    };
  }
}

// Global registry of circuit breakers
const breakers = new Map();

const getCircuitBreaker = (name, options) => {
  if (!breakers.has(name)) {
    breakers.set(name, new CircuitBreaker(name, options));
  }
  return breakers.get(name);
};

module.exports = {
  CircuitBreaker,
  getCircuitBreaker
};
