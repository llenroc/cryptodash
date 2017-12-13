/*jshint esversion: 6 */
"use strict"

let app = new Vue({

    el: "#app",
    data: { 
        appName: 'Crypto.Dash',
        marketData: {},
        top10: [],
        coinImgCache: []
    },    
    created: function() {        
        this.getMarket();
        this.getCoinDetails();
        this.getTop10();
    },     
    methods: {

        // Retrieve the top 10 coins by value
        getTop10: function () {       
           
            axios.get('https://api.coinmarketcap.com/v1/ticker/?limit=10')
                .then((response) => {
                    this.top10 = response.data;               
                    this.setCoinImages(this.top10);
                })
                .catch((error) => {
                    console.log(error);
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
        }
    }
});


           /* axios.get('https://www.cryptocompare.com/api/data/coinlist/', {      
                method: 'GET',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                }})
                .then((response) => {
                    this.coinCache = response.data.Data;
                })
                .catch((error) => {
                    console.log(error);
                });*/