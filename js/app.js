/*jshint esversion: 6 */
"use strict"

let app = new Vue({

    el: "#app",
    data: { 
        appName: 'Crypto.Dash',
        quoteCurrency: 'USD', 
        marketData: {},
        top10: [],
        coinImgCache: { },

        coins: [],
        symbols: ['BTC', 'ETH', 'LTC'],
        symbolSearchText: '',
        coinCache: []
    },    
    created: function() { 

        this.loadData();

       // this.loadDataSources();    

    },     
    methods: {

        onAddClicked: function(event) {
            
            // TODO: Validation, etc.

            this.addSymbol(this.symbolSearchText);
        },

        onRemoveClicked: function(event) {

        },

        addSymbol: function(symbol) {
                        
            var newCoin = {
                name: this.coinCache[symbol].Name,
                symbol: symbol,
                image: 'https://www.cryptocompare.com' + this.coinCache[symbol].ImageUrl,
                price: 0,
                percentChanged: 0
            };

            this.coins.push(newCoin);            
            this.subscribeCoin(symbol, this.quoteCurrency);
        },

        removeSymbol: function(symbol) {            
            // Implement
        },

        loadData: function() {
            
            axios.get('https://min-api.cryptocompare.com/data/all/coinlist')
                .then((response) => {
                    this.coinCache = response.data.Data;

                    // Load from cookies.
                })
                .catch((error) => {
                    console.log(error);
                });

        },

         updateCoin: function(symbol, newPrice, open24hour) {
            
            if(typeof(newPrice) == 'undefined')
                return; 

            var coin = this.coins.find(function(item) { return item.symbol === symbol; });

            if(typeof(coin) == 'undefined')
                return;

            coin.price = newPrice;

            if(typeof(open24hour) != 'undefined') {
                var percentChanged = ((newPrice - open24hour) /  open24hour * 100).toFixed(2);
                coin.percentChanged = percentChanged;
            }
        },

        subscribeCoin: function(symbol, currency) {

            var socket = io.connect('https://streamer.cryptocompare.com/');
            var subscription = ['5~CCCAGG~' + this.getCoinAlias(symbol) + '~' + currency];

            socket.emit('SubAdd', { subs: subscription });

            socket.on("m", (message) => {
                var messageType = message.substring(0, message.indexOf("~"));
                
                var result = {};
    
                if(messageType === CCC.STATIC.TYPE.CURRENTAGG) {
                    result = CCC.CURRENT.unpack(message);
                    this.updateCoin(result.FROMSYMBOL, result.PRICE, result.OPEN24HOUR);
                }    
            });

        },
        // Retrieve the global market data
        getMarket: function () {
            axios.get('https://api.coinmarketcap.com/v1/global')
                .then((response) => {
                    this.marketData = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },

        getCoinAlias: function(symbol) {
            if(symbol === 'MIOTA') 
                return 'IOT';

            return symbol;
        }
    }
});
