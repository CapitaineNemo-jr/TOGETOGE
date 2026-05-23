// アプリケーションデータ
let groupName = "";
let currentUserId = "";
let members = []; // グループに参加しているIDのリスト
let surveyData = {}; // IDごとの希望データ { 'taro': {budget: 30000, activity: '温泉'}, ... }
let votes = { A: 0, B: 0 };
let votedUsers = []; // すでに投票した人のIDリスト

// グラフ用インスタンス
let budgetChartIdx = null;
let activityChartIdx = null;
let voteChartIdx = null;

// ログイン処理（グループ作成・参加）
function login() {
    groupName = document.getElementById('groupNameInput').value.trim();
    currentUserId = document.getElementById('userIdInput').value.trim();

    if (!groupName || !currentUserId) {
        alert("グループ名とユーザーIDを入力してください。");
        return;
    }

    // メンバーリストに自分を追加
    if (!members.includes(currentUserId)) {
        members.push(currentUserId);
    }

    // 画面切り替え
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';

    // 表示の更新
    document.getElementById('displayGroupName').innerText = groupName;
    updateUserDisplay();
    updateMemberList();
}

// メンバー招待（デモ用にIDを追加する）
function inviteMember() {
    const inviteId = document.getElementById('inviteIdInput').value.trim();
    if (!inviteId) return;

    if (members.includes(inviteId)) {
        alert("そのIDはすでに参加しています。");
        return;
    }

    members.push(inviteId);
    document.getElementById('inviteIdInput').value = '';
    updateMemberList();
    alert(`メンバー「${inviteId}」に参加依頼を送信し、グループに追加しました！`);
}

// メンバー一覧と、デモ用の切り替えセレクトボックスを更新
function updateMemberList() {
    const listEl = document.getElementById('memberList');
    const switchEl = document.getElementById('userSwitch');
    
    listEl.innerHTML = '';
    switchEl.innerHTML = '';

    members.forEach(m => {
        // 一覧の更新
        const li = document.createElement('li');
        const isAnswered = surveyData[m] ? " (回答済)" : " (未回答)";
        li.innerText = `👤 ${m}${isAnswered}`;
        listEl.appendChild(li);

        // 切り替え用セレクトボックスの更新
        const opt = document.createElement('option');
        opt.value = m;
        opt.innerText = m;
        if (m === currentUserId) opt.selected = true;
        switchEl.appendChild(opt);
    });
}

// 操作ユーザーの切り替え（発表デモ用）
function switchUser(userId) {
    currentUserId = userId;
    updateUserDisplay();
    
    // フォームの値を、もしそのユーザーがすでに回答していれば再現、なければ初期化
    if (surveyData[currentUserId]) {
        document.getElementById('userBudget').value = surveyData[currentUserId].budget;
        document.getElementById('userActivity').value = surveyData[currentUserId].activity;
    } else {
        document.getElementById('userBudget').value = 30000;
        document.getElementById('userActivity').value = '観光名所巡り';
    }
}

function updateUserDisplay() {
    document.getElementById('displayUserId').innerText = currentUserId;
}

// 希望フォームの送信
document.getElementById('surveyForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const budget = parseInt(document.getElementById('userBudget').value);
    const activity = document.getElementById('userActivity').value;

    // 現在のログインIDのデータとして保存（上書き可能）
    surveyData[currentUserId] = { budget, activity };

    updateCharts();
    updateProposals();
    updateMemberList();
    alert(`ID: ${currentUserId} の希望を登録しました！`);
});

// グラフ更新
function updateCharts() {
    const dataArray = Object.values(surveyData);
    const idArray = Object.keys(surveyData);
    if (dataArray.length === 0) return;

    // 1. 予算グラフ
    const budgets = dataArray.map(d => d.budget);
    if (budgetChartIdx) budgetChartIdx.destroy();
    const ctxB = document.getElementById('budgetChart').getContext('2d');
    budgetChartIdx = new Chart(ctxB, {
        type: 'bar',
        data: {
            labels: idArray,
            datasets: [{ label: '予算 (円)', data: budgets, backgroundColor: '#3498db' }]
        },
        options: { responsive: true }
    });

    // 2. やりたいことグラフ
    const activityCounts = {};
    dataArray.forEach(d => {
        activityCounts[d.activity] = (activityCounts[d.activity] || 0) + 1;
    });

    if (activityChartIdx) activityChartIdx.destroy();
    const ctxA = document.getElementById('activityChart').getContext('2d');
    activityChartIdx = new Chart(ctxA, {
        type: 'doughnut',
        data: {
            labels: Object.keys(activityCounts),
            datasets: [{ data: Object.values(activityCounts), backgroundColor: ['#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'] }]
        },
        options: { responsive: true }
    });
}

// プラン提案の更新
function updateProposals() {
    const dataArray = Object.values(surveyData);
    if (dataArray.length === 0) return;

    const avgBudget = dataArray.reduce((sum, d) => sum + d.budget, 0) / dataArray.length;

    if (avgBudget < 20000) {
        document.getElementById('planADesc').innerText = `予算重視！近場で楽しむローカル日帰り観光ツアー（想定費用: 約${Math.round(avgBudget)}円）`;
        document.getElementById('planBDesc').innerText = `お家やレンタルスペースを借り切ってまったりパーティー（想定費用: 約${Math.round(avgBudget * 0.8)}円）`;
    } else {
        document.getElementById('planADesc').innerText = `ちょっと贅沢！話題のスポットを巡る1泊2日の温泉旅行（想定費用: 約${Math.round(avgBudget)}円）`;
        document.getElementById('planBDesc').innerText = `グランピング施設で大自然とリッチなBBQを堪能するプラン（想定費用: 約${Math.round(avgBudget * 0.9)}円）`;
    }
}

// 【重要】1人1票のチェック付き投票システム
function castVote(plan) {
    // そもそも希望を出していない（グループにアクティブじゃない）場合は弾く仕様
    if (!surveyData[currentUserId]) {
        alert("投票する前に、まずは「1. あなたの希望を入力」から条件を送信してください！");
        return;
    }

    // ★ここで1人1票の重複チェック！
    if (votedUsers.includes(currentUserId)) {
        alert(`❌ エラー: ID「${currentUserId}」はすでに投票済みです。1人1票までしか投票できません！`);
        return;
    }

    // 投票を記録
    votes[plan]++;
    votedUsers.push(currentUserId); // 投票済みリストに現在のIDを追加
    
    updateVoteChart();
    alert(`ID「${currentUserId}」の投票を受け付けました！`);
}

// 投票結果グラフ
function updateVoteChart() {
    if (voteChartIdx) voteChartIdx.destroy();
    const ctxV = document.getElementById('voteChart').getContext('2d');
    voteChartIdx = new Chart(ctxV, {
        type: 'pie',
        data: {
            labels: ['プランA', 'プランB'],
            datasets: [{ data: [votes.A, votes.B], backgroundColor: ['#2ecc71', '#3498db'] }]
        },
        options: { responsive: true }
    });
}
