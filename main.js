 //狀態機
 const GAME_STATE = {
   FirstCardAwaits: "FirstCardAwaits",
   SecondCardAwait: "SecondCardAwait",
   CardsMatchFailed: "CardsMatchFailed",
   CardsMatched: "CardsMatched",
   GameFinished: "GameFinished",
 }


//花色
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

// Ｃ遊戲狀態有關，統一發派動作
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  //1.發牌
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //2.執行動作
  dispatchCardsAction (card) {
    if (!card.classList.contains('back')) {
      return
    }
    //比對多個遊戲狀態下，分別做什麼
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card) //先翻再丟進空陣列
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwait
        break
      case GAME_STATE.SecondCardAwait:
        //翻第二張，嘗試次數就要+1
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card) 
        //判斷是否成功
        if (model.isRevealedMatched()) {
          //成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          //遊戲完成
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)//失敗動畫在蓋回去之前
          setTimeout(this.resetCards,1000) //瀏覽器預設函式
        } break
    } 
  }, 
  //3.重蓋回去
  resetCards () {
     view.flipCards(...model.revealedCards)
     model.revealedCards = []
     controller.currentState = GAME_STATE.FirstCardAwaits
    }  
    
    
  

}

// Ｍ集中管理資料有關
const model = {
  revealedCards: [], //暫存被翻開的卡

  //布林值，回傳controller判斷流程
  isRevealedMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}


// Ｖ畫面有關
const view = { 
  //1.特殊數字轉換
  transformNumber(number) { 
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  
  //2.1 預設畫面為背面(翻牌步驟時拆分html)
  getCardElement(index) {  
    return `
      <div data-index="${index}" class="card back"></div>`
  },

  //2.2 負責選出 #cards 並抽換內容，點擊時才翻正面
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `   
       <p>${number}</p>
       <img src="${symbol}">
       <p>${number}</p>
     `   
  },

  //3.負責生成卡片內容，包括花色和數字
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  //4.點擊翻面
  flipCards(...cards) {
    //轉成正面
    cards.map(card => {
      if (card.classList.contains('back')) {
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }
     //轉成背面
    card.classList.add('back')
    card.innerHTML = null
    })
  },

  //5.配對成功的樣式
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })  
  },
  //6.展現分數與次數
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`
  },
  //7.翻錯動畫特效
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend',event => event.target.classList.remove('wrong'),{ once: true })
    }) //{once: true}重複點錯時重掛監聽
  },
  //8.遊戲結束畫面
  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>恭喜過關！</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }

}

const utility = {
  //4.洗牌（Fisher-Yates Shuffle)放回displayCard 亂數生成52張卡牌
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  },

}
controller.generateCards() //取代view.displayCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardsAction(card)
  })
})
