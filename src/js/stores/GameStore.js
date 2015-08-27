var AppDispatcher = require('../dispatcher/AppDispatcher');
var GameConstants = require('../constants/GameConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var savedData = {
  playerName: 'Player',
  fish: [],
  upgrades: []
};

// Load data from cache?
if(window.localStorage.gameData) {
  console.log('Data loaded from browser cache.');
  savedData = JSON.parse(window.localStorage.gameData);
}

var GameStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  getTotalFish: function() {
    var totalFish = 0;
    savedData.fish.forEach(function(fishType) {
      totalFish += fishType.amount;
    });

    return totalFish;
  },

  getAllFish: function() {
    return savedData.fish;
  },

  getPlayerName: function() {
    if(savedData.playerName) {
      return savedData.playerName;
    } else {
      return 'Player';
    }
  },

  getUpgradeCount: function(upgradeId) {
    if(typeof savedData.upgrades === 'undefined') {
      savedData.upgrades = [];
    }

    for(var i = 0; i < savedData.upgrades.length; i++) {
      if(savedData.upgrades[i].ID === upgradeId) {
        return savedData.upgrades[i].count;
      }
    }

    return 0;
  },

  getAvailableUpgrades: function() {
    var upgrades = GameConstants.UPGRADES;
    upgrades.forEach(function(upgrade) {
      upgrade.OWNED = this.getUpgradeCount(upgrade.ID);
    }.bind(this));
    return upgrades;
  },

  getNetWorth: function() {
    var worth = 0;

    savedData.fish.forEach(function(fish) {
      switch(fish.type) {
        case GameConstants.FISH_TYPES.BLACK:
          worth += (GameConstants.FISH_VALUES.BLACK * fish.amount);
          break;
      }
    });

    return worth;
  },

  setPlayerName: function(newName) {
    savedData.playerName = newName;
    this.saveToBrowser();
    this.emitChange();
  },

  saveToBrowser: function() {
    window.localStorage.gameData = JSON.stringify(savedData);
  },

  captureFish: function() {
    var alreadyHaveType = false;

    for(var i = 0; i < savedData.fish.length; i++) {
      if(savedData.fish[i].type === GameConstants.FISH_TYPES.BLACK) {
        savedData.fish[i].amount++;
        alreadyHaveType = true;
        break;
      }
    }

    if(!alreadyHaveType) {
      savedData.fish.push({
        type: GameConstants.FISH_TYPES.BLACK,
        amount: 1
      });
    }

    this.saveToBrowser();
    this.emitChange();
  },

  /**
   * Attempt to pay for something with fish (least to greatest value)
   * @param  {int} amount The cost of what you want to pay for
   * @return {bool}       Whether or not the payment went through
   */
  pay: function(amount) {

  },

  /**
   * Attempt to purchase an upgrade
   * @param  {string} upgradeId The upgrade identifier from GameConstants
   */
  purchaseUpgrade: function(upgradeId) {
    var havePurchasedBefore = false;
    var purchaseSuccessful = true;

    if(typeof savedData.upgrades === 'undefined') {
      savedData.upgrades = [];
    }

    for(var i = 0; i < savedData.upgrades.length; i++) {
      if(savedData.upgrades[i].ID === upgradeId) {
        havePurchasedBefore = true;
        savedData.upgrades[i].count++;
        break;
      }
    }

    if(!havePurchasedBefore) {
      savedData.upgrades.push({
        ID: upgradeId,
        count: 1
      });
    }

    if(purchaseSuccessful) {
      this.saveToBrowser();
      this.emitChange();
    }
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch(action.actionType) {
      case GameConstants.GAME_CLICK_FISH:
        GameStore.captureFish();
        break;
      case GameConstants.GAME_SET_NAME:
        GameStore.setPlayerName(action.newName);
        break;
      case GameConstants.GAME_PURCHASE_UPGRADE:
        GameStore.purchaseUpgrade(action.upgradeId);
        break;
    }

    return true; // No errors.
  })

});

module.exports = GameStore;
