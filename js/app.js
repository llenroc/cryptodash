/*jshint esversion: 6 */
"use strict"

let app = new Vue({

    el: "#app",
    data: { 
        appName: 'Crypto.Dash',
        quoteCurrency: 'USD', 
        marketData: {},
        top10: [],
        coinImgCache: []
    },    
    created: function() { 

        this.loadDataSources();    

    },     
    ready: function() {
        
    },
    methods: {

        loadDataSources: function() {
            axios.get('https://api.coinmarketcap.com/v1/ticker/?limit=10')
            .then((response) => {
                this.top10 = this.getCoinsViewModel(response.data);         
                this.getCoinDetails();      
                this.setCoinImages(this.top10);
                this.subscribeToUpdates(this.top10, this.quoteCurrency);
            })
            .catch((error) => {
                console.log(error);
            });
        },

        getCoinsViewModel: function(top10fromApi) {

            var coins = [];

            for(var index in top10fromApi)
            {
                coins.push({
                    name: top10fromApi[index].name,
                    symbol: top10fromApi[index].symbol,
                    price: top10fromApi[index].price_usd,
                    percentChanged: top10fromApi[index].percent_change_24h
                });                
            }

            return coins;
        },
        updateCoin: function(symbol, newPrice, open24hour) {
            
            if(typeof(newPrice) == 'undefined')
                return; 

            var coin = this.top10.find(function(item) { return item.symbol === symbol; });

            if(typeof(coin) == 'undefined')
                return;

            coin.price = newPrice;

            if(typeof(open24hour) != 'undefined') {
                var percentChanged = ((newPrice - open24hour) /  open24hour * 100).toFixed(2);
                coin.percentChanged = percentChanged;
            }
        },

        // Subscribe to the market price updates for the top 10 coins
        subscribeToUpdates: function (coins, currency) {

            var subscriptions = [];

            for (var index in coins)
            {
                subscriptions.push('5~CCCAGG~' + this.getCoinAlias(coins[index].symbol) + '~' + currency);
            }

            var socket = io.connect('https://streamer.cryptocompare.com/');
    
            socket.emit('SubAdd', { subs: subscriptions });
    
            socket.on("m", (message) => {
                var messageType = message.substring(0, message.indexOf("~"));
                
                var result = {};
    
                if(messageType === CCC.STATIC.TYPE.CURRENTAGG) {
                    result = CCC.CURRENT.unpack(message);
                    this.updateCoin(result.FROMSYMBOL, result.PRICE, result.OPEN24HOUR);
                    console.log(result);
                   // this.top10.sort((a,b) => { return a.-b; });
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

        // Retrieve the top 10 images for the coins
        getCoinDetails: function() {
            this.coinImgCache.push({ symbol: 'BTC', url: 'https://www.cryptocompare.com/media/19633/btc.png' });
            this.coinImgCache.push({ symbol: 'ETH', url: 'https://www.cryptocompare.com/media/20646/eth_logo.png'});
            this.coinImgCache.push({ symbol: 'XRP', url: 'https://www.cryptocompare.com/media/19972/ripple.png'});
            this.coinImgCache.push({ symbol: 'MIOTA', url: 'https://www.cryptocompare.com/media/1383540/iota_logo.png'});
            this.coinImgCache.push({ symbol: 'LTC', url: 'https://www.cryptocompare.com/media/19782/litecoin-logo.png'});
            this.coinImgCache.push({ symbol: 'DASH', url: 'https://www.cryptocompare.com/media/20626/imageedit_27_4355944719.png'});
            this.coinImgCache.push({ symbol: 'XEM', url: 'https://www.cryptocompare.com/media/20490/xem.png'});
            this.coinImgCache.push({ symbol: 'BTG', url: 'https://www.cryptocompare.com/media/12318377/btg.png'});
            this.coinImgCache.push({ symbol: 'XMR', url: 'https://www.cryptocompare.com/media/19969/xmr.png'});
            this.coinImgCache.push({ symbol: 'BCH', url: 'https://www.cryptocompare.com/media/1383919/bch.jpg'});

        },

        // Tidy this shit up. Lambda equivs?
        setCoinImages: function(){
            
            for(var i = 0; i < this.top10.length; i++) {
                for(var x = 0; x < this.coinImgCache.length; x++) {
                    if(this.coinImgCache[x].symbol === this.top10[i].symbol) {
                        this.top10[i].image = this.coinImgCache[x].url;
                        break;
                    }
                }
            }
        },

        getCoinAlias: function(symbol) {
            if(symbol === 'MIOTA') 
                return 'IOT';

            return symbol;
        }
    }
});

// Refresh the pages data sources periodically to pull the new top 10 coins from the coin market cap api
// Feels a little hacky
// This will refresh all prices at once
setInterval(() => {
    app.loadDataSources();
}, 5 * 60 * 1000);