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
    goodFoods: {
        progress: 0,
        target: 14
    },
    badFoods: {
        progress: 0,
        target: 7
    }
}, s );

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
    refresh();
}

const refresh = () => {
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
    <h2>Good foods</h2>
    <progress-bar>${ stats.goodFoods.progress / stats.goodFoods.target }</progress-bar>
    <strong>${stats.goodFoods.progress}</strong>/<strong>${stats.goodFoods.target}</strong>
    <ul>
    <li>beans</li>
    <li>barley</li>
    <li>fish</li>
    <li>nuts</li>
    <li>bananas</li>
    </ul>
    <button data-key="goodFoods" data-increment="1">+1</button>
    <h2>Bad foods</h2>
    <progress-bar>${ stats.badFoods.progress / stats.badFoods.target }</progress-bar>
    <strong>${stats.badFoods.progress}</strong>/<strong>${stats.badFoods.target}</strong>
    <button data-key="badFoods" data-increment="1">+1</button>
     <ul>
    <li>trans fats/li>
    <li>red meat</li>
    <li>fried food</li>
    </ul>
`;  
}

const updateStat = (key, value) => {
    const target = stats[key].target;
    stats[key].progress += value;
    if ( stats[key].progress > target ) {
        stats[key].progress = target;
    }
    save();
}

refresh();
app.addEventListener('click', ( ev ) => {
    const btn = ev.target;
    if ( btn.matches( 'button' ) ) {
        updateStat(btn.dataset.key, parseInt( btn.dataset.increment, 10 ) );
    }
})
