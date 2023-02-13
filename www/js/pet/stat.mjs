const decayRates = {
    food:   12  / 3600,
    sleep: -30  / 3600,
    clean:  20  / 3600,
    joy:    300 / 3600
}

/**
 * Fetches the current stats of the pet, decayed based on the time elapsed.
 * @returns {object}
 */
export function getStats() {
    const stats = JSON.parse(localStorage.getItem('stats')) ?? {food:0, sleep:0, clean:0, joy:0};
    const lastUpdated = localStorage.getItem('lastUpdated') ?? Date.now();

    // Enabling test mode will let an hour pass in a minute.
    const testMode = localStorage.getItem('testMode') === 'true' ? 60 : 1;

    const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);

    for (const [stat, multiplier] of Object.entries(decayRates))
        stats[stat] *= 1+(-multiplier*elapsed*testMode);

    return stats;
}