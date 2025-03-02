var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _rankResult, _numbers, _lottos;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const createDomElement = (tag, props) => {
  if (tag === "svg" || tag === "path") {
    const element2 = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(props).forEach(([key, value]) => {
      element2.setAttribute(`${key}`, value);
    });
    return element2;
  }
  const element = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    element[key] = value;
  });
  return element;
};
const $lottoBuyError = () => {
  const lottoBuyError = createDomElement("span", {
    className: "lotto_buy_error",
    id: "lottoBuyError"
  });
  return lottoBuyError;
};
const $purchaseFormButton = () => {
  const purchaseFormButton = createDomElement("button", {
    type: "submit",
    className: "disabled_button",
    id: "buyButton",
    textContent: "구입",
    disabled: true
  });
  return purchaseFormButton;
};
const showSuccessState = (textId, buttonId) => {
  const textArea = document.getElementById(textId);
  const buttonArea = document.getElementById(buttonId);
  textArea.textContent = "";
  textArea.classList.remove("show");
  buttonArea.classList.remove("disabled_button");
  buttonArea.disabled = false;
};
const showErrorState = (textId, buttonId, error) => {
  const textArea = document.getElementById(textId);
  const buttonArea = document.getElementById(buttonId);
  textArea.textContent = error.message;
  textArea.classList.add("show");
  buttonArea.classList.add("disabled_button");
  buttonArea.disabled = true;
};
const LOTTO_RULE = Object.freeze({
  MIN_RANGE: 1,
  MAX_RANGE: 45,
  LENGTH: 6,
  PRICE: 1e3,
  MAX_BUY_MONEY: 1e5
});
const INITIAL_NUMBER = 0;
const ONE_TICKET = 1;
const PRIZE_WEB_MESSAGES = {
  first: "6개 일치",
  second: "5개+보너스볼",
  third: "5개 일치",
  fourth: "4개 일치",
  fifth: "3개 일치"
};
const PRIZE_TITLE = ["당첨 번호", "보너스 번호"];
const ERROR = Object.freeze({
  NORMALIZATION: (message) => `[ERROR] ${message}`,
  MONEY: {
    EMPTY_VALUE: "로또 구입 금액은 0원 이하일수 없다.",
    REST_VALUE: "로또 구입 금액은 1,000원으로 나눠떨어져야 한다.",
    MAX_OVER_VALUE: "로또 구입 금액은 100,000원 이하여야 한다."
  },
  LOTTO_NUMBER: {
    QUANTITY: "로또 번호는 6자리여야 한다.",
    RANGE: "로또 번호의 숫자 범위 1 ~ 45이다.",
    DUPLICATION: "로또 번호의 숫자는 중복될 수 없다."
  },
  BONUS: {
    RANGE: "보너스 번호의 숫자 범위 1 ~ 45이다.",
    DUPLICATION: "보너스 번호는 당첨 로또의 있는 숫자와 중복되면 안된다."
  },
  RESTART: {
    YES_OR_NO: "y 혹은 n 중에 하나를 입력해주세요."
  }
});
function validateMoney(money) {
  if (money <= INITIAL_NUMBER) {
    throw new Error(ERROR.MONEY.EMPTY_VALUE);
  }
  if (money % LOTTO_RULE.PRICE !== INITIAL_NUMBER) {
    throw new Error(ERROR.MONEY.REST_VALUE);
  }
  if (money > LOTTO_RULE.MAX_BUY_MONEY) {
    throw new Error(ERROR.MONEY.MAX_OVER_VALUE);
  }
}
function lottoNumberCondition(number) {
  return number >= LOTTO_RULE.MIN_RANGE && number <= LOTTO_RULE.MAX_RANGE;
}
function validateLottoNumber(numbers) {
  if (numbers.length !== LOTTO_RULE.LENGTH) {
    throw new Error(ERROR.LOTTO_NUMBER.QUANTITY);
  }
  if (!numbers.every(lottoNumberCondition)) {
    throw new Error(ERROR.LOTTO_NUMBER.RANGE);
  }
  if (new Set(numbers).size !== LOTTO_RULE.LENGTH) {
    throw new Error(ERROR.LOTTO_NUMBER.DUPLICATION);
  }
}
function validateBonus(bonus, winningLotto) {
  if (!lottoNumberCondition(bonus)) {
    throw new Error(ERROR.BONUS.RANGE);
  }
  if (winningLotto.includes(bonus)) {
    throw new Error(ERROR.BONUS.DUPLICATION);
  }
}
const moneyInputOption = {
  type: "number",
  name: "money",
  min: 1e3,
  max: 1e5,
  placeholder: "1,000원 ~ 100,000원 구매가 가능합니다."
};
const $purchaseFormInput = () => {
  const purchaseFormInput = createDomElement("input", moneyInputOption);
  purchaseFormInput.addEventListener("input", () => {
    try {
      validateMoney(purchaseFormInput.value);
      showSuccessState("lottoBuyError", "buyButton");
    } catch (error) {
      showErrorState("lottoBuyError", "buyButton", error);
    }
  });
  return purchaseFormInput;
};
const $headerPurchaseForm = () => {
  const headerPurchaseForm = createDomElement("form", {
    className: "lotto_form",
    id: "lottoBuyForm"
  });
  headerPurchaseForm.appendChild($purchaseFormInput());
  headerPurchaseForm.appendChild($purchaseFormButton());
  return headerPurchaseForm;
};
const $headerSubTitle = () => {
  const headerSubTitle = createDomElement("p", {
    className: "lotto_subtitle",
    textContent: "구입할 금액을 입력해주세요."
  });
  return headerSubTitle;
};
const $headerTitle = () => {
  const headerTitle = createDomElement("b", {
    className: "lotto_title title_style",
    textContent: "🎱 내 번호 당첨 확인 🎱"
  });
  return headerTitle;
};
const $lottoHeader = () => {
  const lottoHeader = createDomElement("div", {
    className: "lotto_header"
  });
  lottoHeader.appendChild($headerTitle());
  lottoHeader.appendChild($headerSubTitle());
  lottoHeader.appendChild($headerPurchaseForm());
  lottoHeader.appendChild($lottoBuyError());
  return lottoHeader;
};
const $contentCountLabel = (count) => {
  const contentCountLabel = createDomElement("label", {
    className: "lotto_count_label",
    textContent: `총 ${count}개를 구매했습니다.`
  });
  return contentCountLabel;
};
const $inputExplain = () => {
  const inputExplain = createDomElement("p", {
    textContent: "지난 주 당첨번호 6개와 보너스 번호 1개를 입력해주세요."
  });
  return inputExplain;
};
const $lottoInputTitle = (PRIZE_TITLE2) => {
  const lottoInputTitle = createDomElement("div", {
    className: "lotto_input_title"
  });
  PRIZE_TITLE2.forEach((text) => {
    const lottoInputTitleText = createDomElement("span", {
      textContent: text
    });
    lottoInputTitle.appendChild(lottoInputTitleText);
  });
  return lottoInputTitle;
};
const bonusNumberOption = {
  className: "bonus_number",
  name: "bonusNumber",
  type: "number",
  min: 1,
  max: 45,
  required: true
};
const $bonusInput = () => {
  const bonusInput = createDomElement("input", bonusNumberOption);
  bonusInput.addEventListener("input", validateAllInputs);
  return bonusInput;
};
const $inputFormButton = () => {
  const inputFormButton = createDomElement("button", {
    type: "submit",
    className: "lotto_form_button disabled_button",
    id: "lottoResultButton",
    textContent: "결과 확인하기"
  });
  return inputFormButton;
};
const winningNumberOption = {
  className: "winning_number",
  name: "winningNumber",
  type: "number",
  min: 1,
  max: 45,
  required: true
};
const $winningInputs = (winningNumbersCount) => {
  const winningNumberInputs = createDomElement("div", {
    className: "lotto_numbers"
  });
  Array.from({ length: winningNumbersCount }, () => {
    const winningInput = createDomElement("input", winningNumberOption);
    winningInput.addEventListener("input", () => {
      validateAllInputs();
    });
    return winningNumberInputs.appendChild(winningInput);
  });
  return winningNumberInputs;
};
const $winningNumbersError = () => {
  const winningNumbersError = createDomElement("span", {
    className: "lotto_winning_numbers_error",
    id: "lottoWinningNumbersError"
  });
  return winningNumbersError;
};
const validateAllInputs = () => {
  try {
    const winningNumberForm = document.getElementById("winningNumberInputForm");
    const allWinningValues = Array.from(winningNumberForm.winningNumber).map((input) => parseInt(input.value, 10)).filter((value) => !isNaN(value));
    const bonusInputValue = parseInt(winningNumberForm.bonusNumber.value, 10);
    validateLottoNumber(allWinningValues);
    validateBonus(bonusInputValue, allWinningValues);
    showSuccessState("lottoWinningNumbersError", "lottoResultButton");
  } catch (error) {
    showErrorState("lottoWinningNumbersError", "lottoResultButton", error);
  }
};
const $lottoFormInputBox = () => {
  const inputFormInputBox = createDomElement("form", {
    className: "lotto_input_box",
    id: "winningNumberInputForm"
  });
  inputFormInputBox.appendChild($winningInputs(LOTTO_RULE.LENGTH));
  inputFormInputBox.appendChild($bonusInput());
  inputFormInputBox.appendChild($winningNumbersError());
  inputFormInputBox.appendChild($inputFormButton());
  return inputFormInputBox;
};
const $lottoInputList = () => {
  const lottoInputList = createDomElement("div", {
    className: "lotto_input_list"
  });
  lottoInputList.appendChild($inputExplain());
  lottoInputList.appendChild($lottoInputTitle(PRIZE_TITLE));
  lottoInputList.appendChild($lottoFormInputBox());
  return lottoInputList;
};
const $ticketIcon = () => {
  const ticketIcon = createDomElement("i", {
    textContent: "🎟️"
  });
  return ticketIcon;
};
const $ticketText = (numbers) => {
  const ticketText = createDomElement("span", {
    textContent: numbers
  });
  return ticketText;
};
const $ticket = (numbers) => {
  const ticket = createDomElement("div", {
    className: "ticket"
  });
  ticket.appendChild($ticketIcon());
  ticket.appendChild($ticketText(numbers));
  return ticket;
};
const $ticketContainer = (lottos) => {
  const ticketContainer = createDomElement("div", {
    className: "ticket_container"
  });
  lottos.forEach(
    (lotto) => ticketContainer.appendChild($ticket(lotto.getNumbers()))
  );
  return ticketContainer;
};
const $createLottoContent = (lottos) => {
  const lottoContent = createDomElement("div", {
    className: "lotto_result_list"
  });
  lottoContent.appendChild($contentCountLabel(lottos.length));
  lottoContent.appendChild($ticketContainer(lottos));
  lottoContent.appendChild($lottoInputList());
  return lottoContent;
};
const eventListenersController = (events2) => {
  events2.forEach(({ target, type, handler }) => {
    if (typeof target === "string") {
      return document.getElementById(target).addEventListener(type, handler);
    }
    return target.addEventListener(type, handler);
  });
};
const $background = () => {
  const background = createDomElement("div", {
    className: "layer_bg",
    id: "layerBg"
  });
  return background;
};
const $closeButtonPath = () => {
  const pathElement = createDomElement("path", {
    d: "M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z",
    fill: "black"
  });
  return pathElement;
};
const $closeButton = () => {
  const closeButton = createDomElement("svg", {
    class: "close_button",
    id: "closeButton",
    tabindex: 0,
    role: "button",
    xmlns: "http://www.w3.org/2000/svg"
  });
  closeButton.appendChild($closeButtonPath());
  return closeButton;
};
const $profit = (revenueRate) => {
  const profit = createDomElement("div", {
    className: "profit_result"
  });
  const profitText = createDomElement("b", {
    textContent: `당신의 총 수익률은 ${revenueRate.toLocaleString()}%입니다.`
  });
  profit.appendChild(profitText);
  return profit;
};
const $header = () => {
  const headerBox = ["일치 갯수", "당첨금", "당첨 갯수"].map((text) => {
    const header = createDomElement("b", {
      textContent: text
    });
    return header;
  });
  return headerBox;
};
const $container = () => {
  const container = createDomElement("div", {
    className: "rank_result_box"
  });
  Array.from($header()).forEach((head) => {
    container.appendChild(head);
  });
  return container;
};
const $content$1 = (key, value) => {
  const rankResultContent = createDomElement("div", {
    className: "rank_result_box"
  });
  [PRIZE_WEB_MESSAGES[key], value.price.toLocaleString(), value.count].forEach(
    (info) => {
      const rankResultContentText = createDomElement("span", {
        textContent: info
      });
      rankResultContent.appendChild(rankResultContentText);
    }
  );
  return rankResultContent;
};
const $rankResult = (result) => {
  const rankResult = createDomElement("div", {
    className: "rank_result"
  });
  rankResult.appendChild($container());
  Object.entries(result).reverse().forEach(([key, value]) => {
    rankResult.appendChild($content$1(key, value));
  });
  return rankResult;
};
const $restart = () => {
  const restart = createDomElement("button", {
    textContent: "다시 시작하기",
    id: "restartButton"
  });
  return restart;
};
const $title = () => {
  const title = createDomElement("span", {
    className: "rank_layer_title",
    textContent: "🏆 당첨 통계 🏆"
  });
  return title;
};
const $content = (rankResult, revenueRate) => {
  const modalContent = createDomElement("div", {
    className: "rank_layer"
  });
  modalContent.appendChild($closeButton());
  modalContent.appendChild($title());
  modalContent.appendChild($rankResult(rankResult));
  modalContent.appendChild($profit(revenueRate));
  modalContent.appendChild($restart());
  return modalContent;
};
const $modal = (rankResult, revenueRate) => {
  const modal = createDomElement("div", {
    className: "rank_layer_modal",
    id: "modal"
  });
  modal.appendChild($background());
  modal.appendChild($content(rankResult, revenueRate));
  return modal;
};
const handleModalClose = () => {
  const modal1 = document.getElementById("modal");
  modal1.remove();
};
const events = [
  { target: "closeButton", type: "click", handler: handleModalClose },
  {
    target: "closeButton",
    type: "keypress",
    handler: (e) => e.keyCode === 13 && handleModalClose()
  },
  { target: "layerBg", type: "click", handler: handleModalClose },
  {
    target: document,
    type: "keydown",
    handler: (e) => e.key === "Escape" && handleModalClose()
  },
  {
    target: "restartButton",
    type: "click",
    handler: () => {
      handleModalClose();
      lottoStart();
    }
  }
];
const handleModal = (e, result, revenueRate) => {
  e.preventDefault();
  document.getElementById("app").appendChild($modal(result, revenueRate));
  eventListenersController(events);
};
class LottoStatistics {
  constructor() {
    __privateAdd(this, _rankResult);
    __privateSet(this, _rankResult, {
      first: { count: 0, price: 2e9 },
      second: { count: 0, price: 3e7 },
      third: { count: 0, price: 15e5 },
      fourth: { count: 0, price: 5e4 },
      fifth: { count: 0, price: 5e3 }
    });
  }
  getRankResult() {
    return __privateGet(this, _rankResult);
  }
  compareLottos(machineLottos, winningNumber) {
    machineLottos.forEach((machineLotto) => {
      const machineLottoNumbers = machineLotto.getNumbers();
      const sameCount = this.matchSameCount(
        machineLottoNumbers,
        winningNumber.lotto
      );
      const isBonusNumber = this.hasBonusNumber(
        machineLottoNumbers,
        winningNumber.bonus
      );
      this.determineRank(sameCount, isBonusNumber);
    });
  }
  determineRank(sameCount, isBonusNumber) {
    if (sameCount === 6) __privateGet(this, _rankResult).first.count += ONE_TICKET;
    if (sameCount === 5 && isBonusNumber)
      __privateGet(this, _rankResult).second.count += ONE_TICKET;
    if (sameCount === 5 && !isBonusNumber)
      __privateGet(this, _rankResult).third.count += ONE_TICKET;
    if (sameCount === 4) __privateGet(this, _rankResult).fourth.count += ONE_TICKET;
    if (sameCount === 3) __privateGet(this, _rankResult).fifth.count += ONE_TICKET;
  }
  hasBonusNumber(machineLotto, bonus) {
    return machineLotto.includes(bonus);
  }
  matchSameCount(machineLotto, winningLotto) {
    return machineLotto.filter((number) => winningLotto.includes(number)).length;
  }
  calculateRevenueRate(profit, investmentCost) {
    return Number((profit / investmentCost * 100).toFixed(1));
  }
  getProfit() {
    return Object.keys(__privateGet(this, _rankResult)).reduce(
      (acc, key) => acc + __privateGet(this, _rankResult)[key].price * __privateGet(this, _rankResult)[key].count,
      INITIAL_NUMBER
    );
  }
}
_rankResult = new WeakMap();
const calculateRevenue = (lottoStatistics, money) => {
  const revenueRate = lottoStatistics.calculateRevenueRate(
    lottoStatistics.getProfit(),
    money
  );
  return revenueRate;
};
const handleLottoStatistics = (lottoStatistics, lottos, winningNumberObj) => {
  lottoStatistics.compareLottos(lottos, winningNumberObj);
  const lottoResultButton = document.getElementById("lottoResultButton");
  lottoResultButton.textContent = "결과 다시 확인하기";
};
const handleLottoNumberValidate = () => {
  const winningForm = document.getElementById("winningNumberInputForm");
  const winningNumbers = Array.from(winningForm.winningNumber).map(
    (input) => parseInt(input.value, 10)
  );
  const bonusNumber = parseInt(winningForm.bonusNumber.value, 10);
  validateLottoNumber(winningNumbers);
  validateBonus(bonusNumber, winningNumbers);
  return {
    bonus: bonusNumber,
    lotto: winningNumbers
  };
};
const handleWinningResult = (e, lottos, money) => {
  e.preventDefault();
  try {
    const winningNumberObj = handleLottoNumberValidate();
    const lottoStatistics = new LottoStatistics();
    handleLottoStatistics(lottoStatistics, lottos, winningNumberObj);
    const revenueRate = calculateRevenue(lottoStatistics, money);
    const rankResult = lottoStatistics.getRankResult();
    handleModal(e, rankResult, revenueRate);
  } catch (error) {
    alert(error.message);
  }
};
const createLottoContent = (lottos, money) => {
  const lottoContainer = document.getElementById("lottoContainer");
  const lottoContent = $createLottoContent(lottos);
  lottoContainer.appendChild(lottoContent);
  lottoContent.addEventListener(
    "submit",
    (e) => handleWinningResult(e, lottos, money)
  );
};
const createLottos = (lottoMachine, money) => {
  lottoMachine.createLottos(money);
  const lottoBuyForm = document.getElementById("lottoBuyForm");
  lottoBuyForm.money.readOnly = true;
  const buyButton = document.getElementById("buyButton");
  buyButton.disabled = true;
  buyButton.classList.add("disabled_button");
  return lottoMachine.getLottos();
};
const handleLottoPurchase = (e, lottoMachine) => {
  e.preventDefault();
  try {
    const money = document.getElementById("lottoBuyForm").money.value;
    validateMoney(money);
    const lottos = createLottos(lottoMachine, money);
    createLottoContent(lottos, money);
  } catch (error) {
    alert(error.message);
  }
};
class Lotto {
  constructor(numbers) {
    __privateAdd(this, _numbers);
    validateLottoNumber(numbers);
    __privateSet(this, _numbers, numbers);
  }
  getNumbers() {
    return __privateGet(this, _numbers);
  }
}
_numbers = new WeakMap();
function pickNumberInList(LOTTO_RULE2) {
  const randomNumbers = /* @__PURE__ */ new Set();
  while (randomNumbers.size < LOTTO_RULE2.LENGTH) {
    const randomNumber = Math.floor(
      Math.random() * (LOTTO_RULE2.MAX_RANGE - LOTTO_RULE2.MIN_RANGE + 1)
    ) + LOTTO_RULE2.MIN_RANGE;
    randomNumbers.add(randomNumber);
  }
  return [...randomNumbers];
}
class LottoMachine {
  constructor() {
    __privateAdd(this, _lottos);
    __privateSet(this, _lottos, []);
  }
  createLottos(money) {
    const quantity = money / LOTTO_RULE.PRICE;
    __privateSet(this, _lottos, Array.from({ length: quantity }).map(
      () => this.createLotto()
    ));
  }
  createLotto() {
    const randomNumbers = pickNumberInList(LOTTO_RULE).sort((a, b) => a - b);
    return new Lotto(randomNumbers);
  }
  getLottos() {
    return __privateGet(this, _lottos);
  }
  getLottoQuantity() {
    return __privateGet(this, _lottos).length;
  }
}
_lottos = new WeakMap();
const lottoStart = () => {
  const lottoMachine = new LottoMachine();
  const lottoContainer = document.getElementById("lottoContainer");
  lottoContainer.innerHTML = "";
  lottoContainer.appendChild($lottoHeader());
  const lottoBuyForm = document.getElementById("lottoBuyForm");
  lottoBuyForm.addEventListener(
    "submit",
    (e) => handleLottoPurchase(e, lottoMachine)
  );
};
lottoStart();
