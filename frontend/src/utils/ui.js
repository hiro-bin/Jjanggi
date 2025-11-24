export const initializeUI = (scene) => {
    const nicknameModal = document.querySelector('#nickname-modal');
    const nicknameForm = document.querySelector('#nickname-form');
    const nicknameInput = document.querySelector('#nickname-input');
    const nicknameError = document.querySelector('#nickname-error');
    const deleteRoomModal = document.querySelector('#delete-room-modal');
    const confirmDeleteBtn = document.querySelector('#confirm-delete-btn');
    const cancelDeleteBtn = document.querySelector('#cancel-delete-btn');
    const surrenderModal = document.querySelector('#surrender-modal');
    const confirmSurrenderBtn = document.querySelector('#confirm-surrender-btn');
    const cancelSurrenderBtn = document.querySelector('#cancel-surrender-btn');
    const gameOverModal = document.querySelector('#game-over-modal');
    const gameOverMessage = document.querySelector('#game-over-message');
    const restartGameBtn = document.querySelector('#restart-game-btn');
    const viewHistoryModalBtn = document.querySelector('#view-history-modal-btn');

    const gameControls = document.querySelector('#game-controls');
    const replayControls = document.querySelector('#replay-controls');

    const newGameButton = document.querySelector('.new-game');
    const loadGameButton = document.querySelector('.load-game');
    const surrenderGameButton = document.querySelector('.surrender-game');
    const leaveRoomButton = document.querySelector('.leave-room');
    const exitReplayBtn = document.querySelector('#exit-replay-btn');
    const prevHistoryBtn = document.querySelector('#prev-history-btn');
    const nextHistoryBtn = document.querySelector('#next-history-btn');

    const player1Info = document.querySelector('#player1-info');
    const player2Info = document.querySelector('#player2-info');
    const historyTurnDisplay = document.querySelector('#history-turn-display');

    const showGameControls = () => {
        gameControls.classList.remove('hidden');
        replayControls.classList.add('hidden');
    };

    const showReplayControls = () => {
        gameControls.classList.add('hidden');
        replayControls.classList.remove('hidden');
    };

    const showNicknameModal = () => nicknameModal.classList.add('show');
    const hideNicknameModal = () => nicknameModal.classList.remove('show');
    const showDeleteRoomModal = () => deleteRoomModal.classList.add('show');
    const hideDeleteRoomModal = () => deleteRoomModal.classList.remove('show');
    const showSurrenderModal = () => surrenderModal.classList.add('show');
    const hideSurrenderModal = () => surrenderModal.classList.remove('show');
    const showGameOverModal = (winnerInfo) => {
        gameOverMessage.innerText = `승자: ${winnerInfo.nickname}`;
        gameOverModal.classList.add('show');
    };

    const setSurrenderButtonEnabled = (enabled) => {
        if (surrenderGameButton) {
            surrenderGameButton.disabled = !enabled;
            if (enabled) {
                surrenderGameButton.classList.remove('disabled');
            } else {
                surrenderGameButton.classList.add('disabled');
            }
        }
    };

    const updateTurnDisplay = (boardState, players) => {
        const player1 = players.find(p => p.role === 'player1');
        const player2 = players.find(p => p.role === 'player2');
        player1Info.textContent = player1 ? `${player1.nickname} (초)` : '초나라 (대기중)';
        player2Info.textContent = player2 ? `${player2.nickname} (한)` : '한나라 (대기중)';

        player1Info.classList.remove('active-turn');
        player2Info.classList.remove('active-turn');

        if (boardState.turn === 'player1') {
            player1Info.classList.add('active-turn');
        } else if (boardState.turn === 'player2') {
            player2Info.classList.add('active-turn');
        }
    };
    
    const updateHistoryTurnDisplay = (index, total) => {
        historyTurnDisplay.textContent = `${index + 1} / ${total}`;
    };

    nicknameForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nickname = nicknameInput.value.trim();
        if (nickname.length === 0 || nickname.length > 10) {
            nicknameError.textContent = '닉네임은 1~10자 사이로 입력해주세요.';
            nicknameError.classList.add('show');
            return;
        }
        nicknameError.classList.remove('show');
        hideNicknameModal();
        scene.joinRoomWithNickname(nickname);
    });

    nicknameInput.addEventListener('input', () => {
        if (nicknameInput.value.length <= 10) nicknameError.classList.remove('show');
    });

    document.querySelectorAll('.new-game').forEach(btn => 
        btn.addEventListener('click', () => window.location.reload())
    );

    loadGameButton.addEventListener('click', () => scene.loadGame());
    leaveRoomButton.addEventListener('click', showDeleteRoomModal);
    surrenderGameButton.addEventListener('click', showSurrenderModal);
    
    cancelDeleteBtn.addEventListener('click', hideDeleteRoomModal);
    confirmDeleteBtn.addEventListener('click', () => {
        hideDeleteRoomModal();
        alert("방을 나갔습니다.");
        window.location.reload();
    });

    cancelSurrenderBtn.addEventListener('click', hideSurrenderModal);
    confirmSurrenderBtn.addEventListener('click', () => {
        hideSurrenderModal();
        scene.surrenderGame();
    });
    
    restartGameBtn.addEventListener('click', () => window.location.reload());
    viewHistoryModalBtn.addEventListener('click', () => {
        scene.enterReplayMode();
        gameOverModal.classList.remove('show');
    });

    exitReplayBtn.addEventListener('click', () => scene.exitReplayMode());
    prevHistoryBtn.addEventListener('click', () => scene.showPreviousStep());
    nextHistoryBtn.addEventListener('click', () => scene.showNextStep());

    showGameControls();

    return {
        updateTurnDisplay,
        showGameOverModal,
        showNicknameModal,
        showReplayControls,
        updateHistoryTurnDisplay,
        showGameControls,
        setSurrenderButtonEnabled
    };
};
