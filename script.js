// --- データ配列群 ---
let plans = [
  { day: "1", time: "10:00", title: "京都駅 集合", memo: "中央口改札の近くのコインロッカー前", budget: "" },
  { day: "1", time: "11:30", title: "ランチ：手織り寿し", memo: "予約済み。各自2,000円くらい", budget: "2000" },
  { day: "2", time: "09:00", title: "ホテル出発", memo: "チェックアウトを忘れないこと！", budget: "" }
];

let candidates = [
  { title: "伏見稲荷大社", memo: "千本鳥居で写真撮りたい！朝早めがいいかも", votes: 4 },
  { title: "アラビカ京都 嵐山", memo: "渡月橋みながらコーヒー飲めるところ☕️", votes: 5 }
];

// 初回読み込み時に、しおりと候補リストを両方描画する
window.onload = function() {
  renderPlans();
  renderCandidates();
};

// ログインの処理
function handleLogin(event) {
  event.preventDefault();
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
}

// タブ切り替えの処理
function switchTab(tabName) {
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => content.classList.add('hidden'));
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  document.getElementById(`nav-${tabName}`).classList.add('active');
}

// しおり（プラン）を追加する処理
function addPlan() {
  const dayVal = document.getElementById('new-day').value;
  const timeVal = document.getElementById('new-time').value;
  const titleVal = document.getElementById('new-title').value.trim();
  const memoVal = document.getElementById('new-memo').value.trim();
  const budgetVal = document.getElementById('new-budget').value.trim();

  if (!timeVal || !titleVal) {
    alert('「時間」と「タイトル」を入力してね！');
    return;
  }

  plans.push({ day: dayVal, time: timeVal, title: titleVal, memo: memoVal, budget: budgetVal });
  renderPlans();

  document.getElementById('new-time').value = '';
  document.getElementById('new-title').value = '';
  document.getElementById('new-memo').value = '';
  document.getElementById('new-budget').value = '';
}

// しおりを描画する処理（ソート込み）
function renderPlans() {
  plans.sort((a, b) => {
    if (a.day !== b.day) return Number(a.day) - Number(b.day);
    return a.time.localeCompare(b.time);
  });

  const container = document.getElementById('timeline-container');
  container.innerHTML = '';

  let currentDay = null;
  let currentTimelineNode = null;

  plans.forEach(plan => {
    if (plan.day !== currentDay) {
      currentDay = plan.day;
      const dayBlock = document.createElement('div');
      dayBlock.className = 'day-block';

      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';
      dayHeader.innerText = `📆 ${currentDay}日目`;
      dayBlock.appendChild(dayHeader);

      currentTimelineNode = document.createElement('div');
      currentTimelineNode.className = 'timeline';
      dayBlock.appendChild(currentTimelineNode);

      container.appendChild(dayBlock);
    }

    let budgetHTML = '';
    if (plan.budget) {
      budgetHTML = `<div class="plan-budget">予算: ¥${Number(plan.budget).toLocaleString()}</div>`;
    }

    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="time">${plan.time}</div>
      <div class="plan-card">
        <div class="plan-title">${plan.title}</div>
        <div class="plan-memo">${plan.memo}</div>
        ${budgetHTML}
      </div>
    `;
    currentTimelineNode.appendChild(item);
  });
}

// 行きたい候補を追加する処理
function addCandidate() {
  const titleInput = document.getElementById('new-candidate-title');
  const memoInput = document.getElementById('new-candidate-memo');

  const titleVal = titleInput.value.trim();
  const memoVal = memoInput.value.trim();

  if (!titleVal) {
    alert('スポット名は必ず入力してね！');
    return;
  }

  candidates.push({ title: titleVal, memo: memoVal, votes: 0 });
  renderCandidates();

  titleInput.value = '';
  memoInput.value = '';
}

// 候補に投票する処理
function voteCandidate(index) {
  candidates[index].votes += 1;
  renderCandidates();
}

// 候補リストを描画する処理（投票数順ソート込み）
function renderCandidates() {
  candidates.sort((a, b) => b.votes - a.votes);

  const container = document.getElementById('candidates-container');
  container.innerHTML = '';

  candidates.forEach((spot, index) => {
    const item = document.createElement('div');
    item.className = 'candidate-item';
    item.innerHTML = `
      <div class="candidate-info">
        <h4>${spot.title}</h4>
        <p>${spot.memo || '（メモなし）'}</p>
      </div>
      <button type="button" class="btn-vote" onclick="voteCandidate(${index})">
        ❤️ ${spot.votes} 票
      </button>
    `;
    container.appendChild(item);
  });
}

// --- グループ名編集のコントロール機能 ---
function checkEnter(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    event.target.blur();    
  }
}

function saveGroupName() {
  const groupNameEl = document.getElementById('group-name');
  let newName = groupNameEl.innerText.trim();

  if (!newName) {
    newName = "無題の旅行 🗺️";
    groupNameEl.innerText = newName;
  }
  console.log("確定した新しいグループ名:", newName);
}

function focusGroupName() {
  const groupNameEl = document.getElementById('group-name');
  groupNameEl.focus();
  
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(groupNameEl);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function saveMemberCount() {
  const memberCountEl = document.getElementById('member-count');
  let newCount = memberCountEl.innerText.trim(); // 入力された文字を取得

  if (!newCount) {
    newCount = "メンバー 1人";
    memberCountEl.innerText = newCount;
  }
  
  console.log("確定した新しいメンバー人数:", newCount);
}
