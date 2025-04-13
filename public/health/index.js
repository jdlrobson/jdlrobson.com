const app = document.getElementById('app');
function getLastSunday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, etc.
    const diff = dayOfWeek === 1 ? 7 : dayOfWeek + 1; // If it's Sunday, go back 7 days, otherwise go back 'dayOfWeek' days
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - diff);
    return lastSunday;
}
const lastSunday = getLastSunday();
const weekNo = getWeekNumber( lastSunday );
const SAVE_KEY = `week-stats-${weekNo}`;
const LOG = `week-stats-log`;
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return weekNo;
}

const statsDefaults = ( s ) => Object.assign( {
    exercise: {
        target: 60 * 2.5,
        progress: 0
    },
    mehFoods: {
        progress: 0,
        target: 7
    },
    goodFoods: {
        progress: 0,
        target: 14
    },
    badFoods: {
        progress: 0,
        target: 7
    }
}, s );

const log = (() => {
    try {
        const logtext = localStorage.getItem(LOG) || '[]';
        return JSON.parse(logtext);
    } catch ( e ) {
        return [];
    }
})();

const stats = (() => {
    try {
        const stats = localStorage.getItem(SAVE_KEY);
        return statsDefaults( JSON.parse(stats) );
    } catch ( e ) {
        return statsDefaults( {} ); 
    }
})();

const save = () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(stats));
    localStorage.setItem(LOG, JSON.stringify(log.slice(0, 10)));
    refresh();
}

const scoreFood = ( stats ) => {
    // X = Y
    // X = 100 / 21 = 5
    // Z = 50 / 21 = 2
    const hasMehFoods = !!stats.mehFoods;
    const mehFoods = hasMehFoods ? stats.mehFoods.progress : 0;
    const goodFoods = stats.goodFoods.progress;
    const badFoods = stats.badFoods.progress;
    const missingMeals = 21 - ( mehFoods + badFoods + goodFoods );
    const standardMeals = missingMeals + mehFoods;

    const foodScore = ( 4.8 * goodFoods ) - ( 4.8 * badFoods ) + ( 2.5 * standardMeals );
    console.log(foodScore);
    return (new Array( Math.round( foodScore / 15 ) )).fill(`⭐`).join('');
};

const previousWeeks = (() => {
    let pastWeek = weekNo;
    const history = [];
    const calc = (s) => Math.floor(
        ( s.progress / s.target ) * 100
    );
    while ( pastWeek > weekNo - 8 ) {
        pastWeek--;
        const previous = localStorage.getItem(`week-stats-${pastWeek}`);
        if ( previous ) {
            const stats = JSON.parse(previous);
            const foodStars = scoreFood(stats);
            history.push(`[week ${pastWeek}] Exercise: ${calc(stats.exercise)}% | Food score ${foodStars}`);
        } else {
            history.push(`[week ${pastWeek}] n/a`);
        }
    }
    return history;
})();

const refresh = () => {
    const hasFoodStat = stats.goodFoods.progress || stats.mehFoods.progress || stats.badFoods.progress;
    app.innerHTML = `
    <h1>Progress week ${ weekNo } / 52</h1>
    <p>Week for ${ lastSunday.getDate() } / ${ lastSunday.getMonth() + 1 } / ${ lastSunday.getFullYear() }
    <h2>Exercise</h2>
    <progress-bar>${stats.exercise.progress / stats.exercise.target}</progress-bar>
    <strong>${stats.exercise.progress}</strong>/<strong>${stats.exercise.target}</strong>
   <button data-key="exercise" data-increment="5">+5m</button>
  <button data-key="exercise" data-increment="15">+15m</button>
      <button data-key="exercise" data-increment="30">+30m</button>
    <button data-key="exercise" data-increment="45">+45m</button>
    <button data-key="exercise" data-increment="60">+60m</button>
    <h2>Meals</h2>
    <span>Current: ${ hasFoodStat ? scoreFood( stats ) : '_' } </span>
    <progress-bar>${ stats.goodFoods.progress / stats.goodFoods.target }</progress-bar>
    <strong>🙂${stats.goodFoods.progress}</strong>/<strong>${stats.goodFoods.target}</strong>
    <progress-bar>${ stats.mehFoods.progress / stats.mehFoods.target }</progress-bar>
    <strong>🤷‍♂️${stats.mehFoods.progress}</strong>/<strong>${stats.mehFoods.target}</strong>
    <progress-bar>${ stats.badFoods.progress / stats.badFoods.target }</progress-bar>
    <strong>☹️${stats.badFoods.progress}</strong>/<strong>${stats.badFoods.target}</strong>
    <div>
    <button data-key="badFoods" data-increment="1">☹️</button>
    <button data-key="mehFoods" data-increment="1">🤷‍♂️</button>
    <button data-key="goodFoods" data-increment="1">🙂</button>
    </div>
    <h3>Food notes</h3>
    <table>
    <tr><th>Good</th><th>Bad</th></tr>
    <tr>
    <td>beans</td><td>trans fats</td></tr>
    <tr><td>barley</li></td><td>red meat</td></tr>
    <tr><td>fish</li></td><td>fried food</td></tr>
    <tr><td>nuts</li></td><td></td></tr>
    <tr><td>bananas</li></td><td></td></tr>
    </table>
    <h2>previously</h2>
    <ul class="listBlock listItalic">${previousWeeks.length ? previousWeeks.map((l)=>`<li>${l}</li>`).join('') : 'N/A'}</ul>
    <h2>log</h2>
    <ul class="listBlock listItalic">${log.length ? log.map((l)=>`<li>${l}</li>`).join('') : 'N/A'}</ul>
`;  
}

const updateStat = (key, value) => {
    stats[key].progress += value;
    log.unshift(`Added ${value} to ${key} on ${new Date()}`);
    save();
}

refresh();
app.addEventListener('click', ( ev ) => {
    const btn = ev.target;
    if ( btn.matches( 'button' ) ) {
        updateStat(btn.dataset.key, parseInt( btn.dataset.increment, 10 ) );
    }
})
