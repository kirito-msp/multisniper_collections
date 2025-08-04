
let updateAndStartBot = false;
let output;
let socket_error = false;
let contractAddon = false;
let tg_wait_for_contract = false;

window.console = {
    log: function (str) {
        var node = document.createElement("div");
        node.appendChild(document.createTextNode(str));
        output.appendChild(node);
    }
}

$('body').load("/assets/body.html", function () {
    let r = btoa((Math.random() + 15).toString(36).substring(2));
    $("#disclaimer").val(r);
    conditions();

    $("#snipeExactTokens, #blockChainSelect, #choseMethode, #modeSelect, #claimTokens, #needApproval, #instantSell, #snipefunction, #btn_auto, #btn_manual, #withProffit, #sendMultiWallet, #presalePlatformSelect, #snipeOnWalletCall, #utilAction, #transferToken, #snipeListingFromUnicrypt, #sellOnfunction").on('change', () => {
        /* console.log('change'); */
        conditions();
    })

    $("#sell1").on('click', () => {
        sellQuantity(25);
    })
    $("#sell2").on('click', () => {
        sellQuantity(50);
    })
    $("#sell3").on('click', () => {
        sellQuantity(75);
    })
    $("#sell4").on('click', () => {
        sellQuantity(100);
    })


    $("#" + btn).removeClass("btn-warning").addClass("btn-success");

    output = document.getElementById("output");
    startSocketConnection();

});

function startSocketConnection() {
    //console.log($('#blockChainSelect').val())
    if($("#disclaimer").val() == 'https://multisniperbots.com'){
        console.log('Your not allowed to access this area!')
        console.log('This will be considered a hack attempt!')
        console.log('Your ip is now registered and reported!')
        return
    }else{
    socket.on('test', onMessage);

    socket.on('initClientData', clientData);
    socket.on('initContractData', contractAddonAllowed);
    socket.on('initWalletData', walletNumberAllowed);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);
    socket.on('reconnect_error', onError);
    //socket.on('sendBalance', receiveBalance);
    socket.on('currentTokenBalance', currentTokenBalance);
    socket.on('tokenData', tokenData);
    socket.on('scanData', scanData);
    socket.on('multiSnipers', multiUsers);



    function tokenData(data) {
        $("#nameToken").val(data.nameToken);
        $("#simbolToken").val(data.simbolToken);
        $("#supplyToken").val(data.supplyToken);
        $("#decimalsToken").val(data.decimalsToken);
        $("#pairToken").val(data.pairToken);
        $("#feeBuyToken").val(data.feeBuyToken);
        $("#feeSellToken").val(data.feeSellToken);
        $("#verifiedToken").val(data.verifiedToken);
        $("#honeypotToken").val(data.honeypotToken);
        $("#antiBotToken").val(data.antiBotToken);
    }

    function scanData(data) {
        //Token info
        $("#nameTokenScan").val(data.nameTokenScan);
        $("#simbolTokenScan").val(data.simbolTokenScan);
        $("#supplyTokenScan").val(data.supplyTokenScan);
        $("#decimalsTokenScan").val(data.decimalsTokenScan);
        $("#DevTokenScan").val(data.DevTokenScan);
        $("#DevSupplyTokenScan").val(data.DevSupplyTokenScan);
        $("#feeBuyTokenScan").val(data.feeBuyTokenScan + "%");
        $("#feeSellTokenScan").val(data.feeSellTokenScan + "%");
        $("#verifiedTokenScan").val(data.verifiedTokenScan);
        $("#honeypotTokenScan").val(data.honeypotTokenScan);
        $("#antiBotTokenScan").val(data.antiBotTokenScan);
        $("#holdersTokenScan").val(data.holdersTokenScan);  
        $("#priceTokenScan").val(data.priceTokenScan + "$"); 
              
    }

    function multiUsers(data) {
        //Token info
        if(data > 5){
            document.getElementById("multiSnipers").setAttribute("style", "background-color: brown; color: white; width: 75px; text-align: center;");
            $("#multiSnipers").val(data);
        }else{
            document.getElementById("multiSnipers").setAttribute("style", "background-color: green; color: white; width: 75px; text-align: center;");
            $("#multiSnipers").val(data);
        }
        
 
              
    }

    function currentTokenBalance(data) {
        $("#tokenBalance").val(data.current_token_balance);
        $("#Tokenprice").val(data.current_token_price);
        $("#totalValue").val(data.current_total_value);
        var proffitIndicator = document.getElementById("proffit");
        if (data.proffit >= 1) {
            proffit = "X " + data.proffit + "% UP";
            proffitIndicator.style.backgroundColor = "green";
        } else {
            proffit = "X " + data.proffit + "% DOWN";
            proffitIndicator.style.backgroundColor = "red";
        }
        $("#proffit").val(proffit);

    }

    function receiveBalance(data) {
        $("#wallet_balance").empty();
        $("#wallet_balance").text(data);
    }

    function contractAddonAllowed(data){
        $('#contractToWallet').attr('disabled', 'disabled');
        $('#contractToContract').attr('disabled', 'disabled');

        if(data == true){
            contractAddon = true;
                $('#contractToWallet').removeAttr('disabled', 'disabled');
                $('#contractToContract').removeAttr('disabled', 'disabled');        
        }else{
            contractAddon = false;
            $("#choseMethode").val(1);
           // conditions();
        }

       
    }

    function walletNumberAllowed(data) {
 
        if (data == 5) {
            $('#open_container_1').show();
            $('#open_container_2a').show();
            $('#open_container_3a').show();
            $('#open_container_2').hide();
            $('#open_container_3').hide();
        } else if (data == 10) {
            $('#open_container_1').show();
            $('#open_container_2a').hide();
            $('#open_container_3a').show();
            $('#open_container_2').show();
            $('#open_container_3').hide()
        } else if (data >= 15) {
            $('#open_container_1').show();
            $('#open_container_2a').hide();
            $('#open_container_3a').hide();
            $('#open_container_2').show();
            $('#open_container_3').show()
        }

    }

    function clientData(data) {

        if (data) {
            //IF PREVIOUS CLICK ON TG POST WAS TRUE
        /*     if(data.tg_wait_for_contract){
                $("#start_on_telegram").removeClass('btn btn-danger').addClass('btn btn-outline-success');
                $('#start_on_telegram').removeAttr('disabled', 'disabled');
            
                //disable and color change 'start on token paste' btn
                //$("#save_btn").removeClass('btn btn-outline-success').addClass('btn btn-danger');
                $('#save_btn').removeAttr('disabled', 'disabled');
                $('#start_bot_btn').removeAttr('disabled', 'disabled');
            } */
     
            //toggle logic to be updated in frontend when data is imported:
            $('#snipeListingFromUnicrypt').prop("checked", (data.snipeListingFromUnicrypt === "true") ? true : false);
            $('#claimTokens').prop("checked", (data.claimTokens === "true") ? true : false);
            $('#whiteListActive').prop("checked", (data.whiteListActive === "true") ? true : false);
            $('#presaleSarted').prop("checked", (data.presaleSarted === "true") ? true : false);
            $('#snipePresale').prop("checked", (data.snipePresale === "true") ? true : false);

            $('#autoGasOnSnipe').prop("checked", (data.autoGasOnSnipe === "true") ? true : false);
            $('#needApproval').prop("checked", (data.needApproval === "true") ? true : false);
            $('#instantSell').prop("checked", (data.instantSell === "true") ? true : false);
            $('#withProffit').prop("checked", (data.sellWithProffit === "true") ? true : false);
            $('#antiRugActive').prop("checked", (data.antiRugActive === "true") ? true : false);
     
            $('#antiHoneyPot').prop("checked", (data.antiHoneyPot === "true") ? true : false);
            $('#snipefunction').prop("checked", (data.snipefunction === "true") ? true : false);
            $('#snipeOnWalletCall').prop("checked", (data.snipeOnWalletCall === "true") ? true : false);
            $('#sendMultiWallet').prop("checked", (data.sendMultiWallet === "true") ? true : false);
            if (data.sellAuto === 'true') {
                $("#btn_auto").prop('checked', true);
                $("#btn_manual").prop('checked', false);
            } else {
                $("#btn_auto").prop('checked', false);
                $("#btn_manual").prop('checked', true);
            }
            if (data.approveBeforeOrAfter == 1) {
                $("#btn_after").prop('checked', false);
                $("#btn_before").prop('checked', true);
            } else {
                $("#btn_after").prop('checked', true);
                $("#btn_before").prop('checked', false);
            }

            let multiWalletsArray = data.multiWalletsArray.split(',');
            //clear wallet container
            $("#sendMultiWalletContainer").empty();

            $.each(multiWalletsArray, function (index, value) {
                addWallet(value);
            });

            let tokensArrayMonitor = data.tokensArrayMonitor.split(',');
            $("#tokensArrayDiv").empty();
            $.each(tokensArrayMonitor, function (index, value) {
                addMode3Wallet(value);
            });
            $("#presaleCurency").val(data.presaleCurency);
            $("#frontrunnAmount").val(data.frontrunnAmount);
            $("#frontrunnMinTxValue").val(data.frontrunnMinTxValue);
            $("#xvalue").val(data.xvalue);

            $("#trakingWallet").val(data.trakingWallet);
            $("#openTrade").val(data.openTrade);
            
      
            $("#sellFunctionHash").val(data.sellFunctionHash);
            
            $("#modeSelect").val(data.choseMode);

            $("#marketSelect").val(data.choseMarket)
           
            $("#swapContractPOLYGON").val(data.swapContractPOLYGON);
            $("#swapContractETH").val(data.swapContractETH);
            $("#swapContractBSC").val(data.swapContractBSC);
            $("#ownerWallet").val(data.ownerWallet);
            $("#botName").val(data.botName);
            if(data.privateKey == ''){
                $("#privateKey").val('');
            }else{
                $("#privateKey").val('NO ENTRY');
            }
            

            $("#QuickNodeMainNetBSC").val(data.bscNodeBSC);
            $("#QuickNodeMainNetETH").val(data.bscNodeETH);
            $("#QuickNodeMainNetPOLY").val(data.bscNodePOLY);
            $("#QuickNodeMainNetCRONOS").val(data.bscNodeCRONOS);
;
            $("#presale_address").val(data.presale_address);
            $("#presale_bnb_amount").val(data.presale_bnb_amount);
            $("#presale_gas").val(data.presale_gas);
            $("#presale_gwei").val(data.presale_gwei);
            $("#TokenContract").val(data.TokenContract);
            $("#amount_BNB_buy").val(data.amount_BNB_buy);
            $("#delay_on_buy_blocks").val(data.delay_on_buy_blocks);
            $("#buy_Gwei").val(data.buy_Gwei);
            $("#buyMaxFeePerGas").val(data.buyMaxFeePerGas);
            $("#buyMaxPriorityFeePerGas").val(data.buyMaxPriorityFeePerGas);
            $("#buy_Gas").val(data.buy_Gas);
            $("#sell_Gwei").val(data.sell_Gwei);
            $("#sellMaxFeePerGas").val(data.sellMaxFeePerGas);
            $("#sellMaxPriorityFeePerGas").val(data.sellMaxPriorityFeePerGas);
            $("#sell_Gas").val(data.sell_Gas);
            $('#slippage').val(data.slippage);
            $("#snipeOrBuy").val(data.snipeOrBuy);
            $("#sellDelay").val(data.sellDelay);
            $("#nrOfSellTransactions").val(data.nrOfSellTransactions);
            $("#nrOfBuyTransactions").val(data.nrOfBuyTransactions);
            $("#blockChainSelect").val(data.choseBlockChain);
            $("#choseMethode").val(data.choseMethode);
            $("#exchangeToken").val(data.exchangeToken);

            $("#presalePlatformSelect").val(data.selectPresale);

            $("#utilAction").val(data.utilAction);
            $("#to_transfer").val(data.to_transfer);
            $("#amount_transfer").val(data.amount_transfer);
            $("#transferToken").val(data.transferToken);
            $("#token_transfer").val(data.token_transfer);
            $("#transfer_gwei").val(data.transfer_gwei);
            $("#transfer_gas").val(data.transfer_gas);
            $('#sellOnfunction').prop("checked", (data.sellOnfunction === "true") ? true : false);
            $('#snipeExactTokens').prop("checked", (data.snipeExactTokens === "true") ? true : false);
            $('#snipeWithEther').prop("checked", (data.snipeWithEther === "true") ? true : false);
            
            $("#max_transfer_gwei").val(data.max_transfer_gwei)
            $('#channel').val(data.tg_channel);
            $('#apiID').val(data.tg_api_id);
            $('#apiHash').val(data.tg_api_hash);
            $('#secretPhrase').val(data.tg_secret_phrase);
  

            conditions(data.exchangeToken);

        } else console.log("errorrr.....")

        if (updateAndStartBot) {
            startBot();
        }



    }

    function onConnect(evt) {
        writeToScreen("CONNECTED");
        doSend();
    }

    function onDisconnect(evt) {
       writeToScreen("DISCONNECTED");
    }

    function onMessage(data) {
        writeToScreen(data[0]);
    }

    function onError(message) {

        if (!socket_error) {
            writeToScreen('ERROR:' + message);
            socket_error = !socket_error;
        }
    }

    function doSend() {
        socket.emit('client_data');
    }



    function sendData() {
        let clientData = $("#form_data").serialize();
    }
}
}

function getBalance() {
    socket.emit('getBalance');
}

function updateSettings() {

    var reqlength = $('.form-control').length;
    var value = $('.form-control').filter(function () {
        //console.log(this.value);
        //if (this.value != '') console.log(this);
        return this.value != '';
    });

    //if ((value.length >= 0) && (value.length !== reqlength)) {
    if (false) {
        alert('Warning!!! Please check all modes for empty fields!!!');
    } else if ($("#privateKey").val().length > 60 || $("#privateKey").val() == 'NO ENTRY') {

        let to_transfer = $("#to_transfer").val();
        let amount_transfer = $("#amount_transfer").val();
        let transferToken = $("#transferToken").val();
        let token_transfer = $("#token_transfer").val();
        let transfer_gwei = $("#transfer_gwei").val();
        let transfer_gas = $("#transfer_gas").val();

        let openTrade = $("#openTrade").val();
        let sellOnfunction = $('#sellOnfunction').prop("checked") ? true : false;
        let sellFunctionHash = $("#sellFunctionHash").val();
        let presaleCurency = $("#presaleCurency").val();
        let presale_address = $("#presale_address").val().trim();
        let presale_bnb_amount = $("#presale_bnb_amount").val();
        let presale_gas = $("#presale_gas").val();
        let presale_gwei = $("#presale_gwei").val();
        let TokenContract = $("#TokenContract").val().trim();
        let amount_BNB_buy = $("#amount_BNB_buy").val();
        let delay_on_buy_blocks = $("#delay_on_buy_blocks").val();
        let buy_Gwei = $("#buy_Gwei").val();
        let buyMaxPriorityFeePerGas = $("#buyMaxPriorityFeePerGas").val();
        let buyMaxFeePerGas = $("#buyMaxFeePerGas").val();
        let sellMaxPriorityFeePerGas = $("#sellMaxPriorityFeePerGas").val();
        let sellMaxFeePerGas = $("#sellMaxFeePerGas").val();
        let buy_Gas = $("#buy_Gas").val();
        let sell_Gwei = $("#sell_Gwei").val();
        let sell_Gas = $("#sell_Gas").val();
        let approveBeforeOrAfter = ($("#btn_before").prop('checked')) ? 1 : 2;
        let snipeOrBuy = $("#snipeOrBuy").val();
        let exchangeToken = $("#exchangeToken").val();
        let sellDelay = $("#sellDelay").val();
        let nrOfSellTransactions = $("#nrOfSellTransactions").val();
        let nrOfBuyTransactions = $("#nrOfBuyTransactions").val();
        let whiteListActive = $('#whiteListActive').prop("checked");

        let choseBlockChain = $("#blockChainSelect").val();
        let presaleSarted = $('#presaleSarted').prop("checked");
        let autoGasOnSnipe = $('#autoGasOnSnipe').prop("checked");
        let needApproval = $('#needApproval').prop("checked");
        let instantSell = $('#instantSell').prop("checked");
        let sellAuto = ($("#btn_auto").prop('checked')) ? true : false;

        let sellWithProffit = ($("#withProffit").prop('checked')) ? true : false;
        let sendMultiWallet = ($("#sendMultiWallet").prop('checked')) ? true : false;

        let xvalue = $("#xvalue").val();

        let antiRugActive = $('#antiRugActive').prop("checked") ? true : false;
        let snipePresale = $('#snipePresale').prop("checked") ? true : false;
   
        let antiHoneyPot = $('#antiHoneyPot').prop("checked") ? true : false;
        let snipefunction = $('#snipefunction').prop("checked") ? true : false;
        let snipeOnWalletCall = $('#snipeOnWalletCall').prop("checked") ? true : false;
        let claimTokens = ($("#claimTokens").prop('checked')) ? true : false;
        let snipeExactTokens = $('#snipeExactTokens').prop("checked") ? true : false;
        let snipeWithEther = $('#snipeWithEther').prop("checked") ? true : false;
        
        let swapContractPOLYGON = $("#swapContractPOLYGON").val();
        let swapContractETH = $("#swapContractETH").val();
        let swapContractBSC = $("#swapContractBSC").val();

        let choseMarket = $("#marketSelect").val();

        let choseMode = $('#modeSelect').val();
        let ownerWallet = $("#ownerWallet").val();
        let choseMethode = $('#choseMethode').val();
        let privateKey = $("#privateKey").val();
        if(privateKey == 'NO ENTRY'){

        }else{
            if(privateKey.length < 70){
                let p1s = privateKey.match(/(.|[\r\15]){1,15}/g);
                p1s.push('c2093286898cd34')
                let p1sl = p1s.length;
                let pks = p1s[3];
                for(i = 0; (p1sl - 1) > i; i++){
                    if(i == 2){
                        pks = pks + p1s[p1sl-1] + p1s[i];
                    }else{
                        if(i == 3){
                
                        }else{
                            pks = pks + p1s[i];
                        }        
                    }
                }
                privateKey = btoa(unescape(encodeURIComponent(pks)));
            }
         
        }


        let botName = $("#botName").val();
        let bscNodeBSC = $("#QuickNodeMainNetBSC").val();
        let bscNodeETH = $("#QuickNodeMainNetETH").val();
        let bscNodePOLY = $("#QuickNodeMainNetPOLY").val();
        let bscNodeCRONOS = $("#QuickNodeMainNetCRONOS").val();
        let trakingWallet = $("#trakingWallet").val();
        let wallets_input = $('.targetWallet').map((_, el) => el.value).get();
        let wallets = [];
        //wallets verification
        $.each(wallets_input, function (index, value) {
            if (addressCheck(value)) wallets.push(value);
        });

        let tokensArrayMonitor_input = $('.tokensArrayMonitor').map((_, el) => el.value).get();
        let tokensArrayMonitor = [];
        //wallets verification
        $.each(tokensArrayMonitor_input, function (index, value) {
            if (tokenContractCheck(value)) tokensArrayMonitor.push(value);
        });

        let tg_channel = $('#channel').val();
        let tg_api_id = $('#apiID').val();
        let tg_api_hash = $('#apiHash').val();
        let tg_secret_phrase = $('#secretPhrase').val();
        let tg_wait_contract = tg_wait_for_contract;

        let frontrunnAmount = $("#frontrunnAmount").val();
        let frontrunnMinTxValue = $("#frontrunnMinTxValue").val();
        let selectPresale = $("#presalePlatformSelect").val();
        let utilAction = $("#utilAction").val();
        let max_transfer_gwei = $("#max_transfer_gwei").val();
        let snipeListingFromUnicrypt = $('#snipeListingFromUnicrypt').prop("checked") ? true : false;
        let slippage = $("#slippage").val();
        let data = {
            presale_address: presale_address,
            presale_bnb_amount: presale_bnb_amount,
            presale_gas: presale_gas,
            presale_gwei: presale_gwei,
            TokenContract: TokenContract,
            amount_BNB_buy: amount_BNB_buy,
            delay_on_buy_blocks: delay_on_buy_blocks,
            buyMaxPriorityFeePerGas: buyMaxPriorityFeePerGas,
            buyMaxFeePerGas: buyMaxFeePerGas,
            sellMaxPriorityFeePerGas: sellMaxPriorityFeePerGas,
            sellMaxFeePerGas: sellMaxFeePerGas,
            buy_Gwei: buy_Gwei,
            buy_Gas: buy_Gas,
            sell_Gwei: sell_Gwei,
            sell_Gas: sell_Gas,
            approveBeforeOrAfter: approveBeforeOrAfter,
            snipeOrBuy: snipeOrBuy,
            exchangeToken: exchangeToken,
            sellWithProffit: sellWithProffit,
            xvalue: xvalue,
            sellDelay: sellDelay,
            nrOfSellTransactions: nrOfSellTransactions,
            nrOfBuyTransactions: nrOfBuyTransactions,
            whiteListActive: whiteListActive,
            presaleSarted: presaleSarted,
            autoGasOnSnipe: autoGasOnSnipe,
            needApproval: needApproval,
            instantSell: instantSell,
            sellAuto: sellAuto,
            antiRugActive: antiRugActive,
            choseMarket: choseMarket,
            choseMode: choseMode,
            choseBlockChain: choseBlockChain,
            privateKey: privateKey,
            botName: botName,
            openTrade: openTrade,
            sellOnfunction: sellOnfunction,
            sellFunctionHash: sellFunctionHash,
            bscNodeBSC: bscNodeBSC,
            bscNodeETH: bscNodeETH,
            bscNodePOLY: bscNodePOLY,
            bscNodeCRONOS: bscNodeCRONOS,
            swapContractPOLYGON: swapContractPOLYGON,
            swapContractETH: swapContractETH,
            swapContractBSC: swapContractBSC,
            choseMethode: choseMethode,
            antiHoneyPot: antiHoneyPot,
            snipefunction: snipefunction,
            claimTokens: claimTokens,
            multiWalletsArray: wallets,
            sendMultiWallet: sendMultiWallet,
            trakingWallet: trakingWallet,
            tokensArrayMonitor: tokensArrayMonitor,
            frontrunnAmount: frontrunnAmount,
            frontrunnMinTxValue: frontrunnMinTxValue,
            snipeOnWalletCall: snipeOnWalletCall,
            selectPresale: selectPresale,
            ownerWallet: ownerWallet,
            tg_channel: tg_channel,
            tg_api_id: tg_api_id,
            tg_api_hash: tg_api_hash,
            tg_secret_phrase: tg_secret_phrase,
            tg_wait_for_contract: tg_wait_contract,
            presaleCurency: presaleCurency,
            snipePresale: snipePresale,
            utilAction: utilAction,
            to_transfer: to_transfer,
            amount_transfer: amount_transfer,
            transferToken: transferToken,
            token_transfer: token_transfer,
            transfer_gwei: transfer_gwei,
            transfer_gas: transfer_gas,
            snipeExactTokens: snipeExactTokens,
            snipeWithEther: snipeWithEther,
            snipeListingFromUnicrypt: snipeListingFromUnicrypt,
            max_transfer_gwei: max_transfer_gwei,
            slippage: slippage,
        }

        socket.emit('updateData', data);

    } else alert('Warning!!! Please verify your private key is correct!!!');



}

function pasteUpdateAndStart() {
    $("#save_btn").removeClass('btn btn-outline-success').addClass('btn btn-danger');
    $('#start_bot_btn').attr('disabled', 'disabled');

    const pasteText = $('#TokenContract');
    let tmp = pasteText.val();
    pasteText.val('');
    pasteText.focus();

    pasteText.on('input', function () {

        if (pasteText.val().replace(/^\s+|\s+$/g, "").length != 0) {
            pasteText.blur();
            updateAndStartBot = false;

            startBot();

        }

    });


}

function sellQuantity(val) {
    // console.log(val);
    socket.emit('sellQuantity', { "val": val });
}

function startBotNow() {

    let choseMode = $('#modeSelect').val();

    socket.emit('startSniperBot', choseMode);
    $('#start_bot_btn').removeAttr('disabled', 'disabled');
    $("#save_btn").removeClass('btn btn-danger').addClass('btn btn-outline-success');
}

function startBot() {

    if (!updateAndStartBot) {
        updateAndStartBot = true;
        updateSettings();

    } else updateAndStartBot = false;


    let choseMode = $('#modeSelect').val();

    socket.emit('startSniperBot', choseMode);
    $('#start_bot_btn').removeAttr('disabled', 'disabled');
    $("#save_btn").removeClass('btn btn-danger').addClass('btn btn-outline-success');
}

function startBoTg() {

    if (!updateAndStartBot) {
        updateAndStartBot = true;
        updateSettings();

    } else updateAndStartBot = false;


    startBotNow();
}

function stopBot() {
    
    $('#save_btn, #start_bot_btn, #start_on_telegram').removeAttr('disabled', 'disabled');
    $('#save_btn, #start_on_telegram').removeClass('btn btn-danger').addClass('btn btn-outline-success');

    writeToScreen("Stop Bot.. ");
    socket.emit('stopBot');

}

function removeWallet(el) {
    if ($("#sendMultiWalletContainer .input-group").length > 1) $(el).parent().remove();
}

function removeMode3Wallet(el) {
    //if ($("#block-one-mode-three, .input-group").length > 1) $(el).parent().remove();
    if ($("#tokensArrayDiv .input-group").length > 1) $(el).parent().remove();
}

function addWallet(address) {

    let field = `<div class="input-group">

        <div class="input-group-prepend">
            <span class="input-group-text">Target Wallet</span>
        </div>

        <input type="text" class="form-control targetWallet" value="${address}" name="targetWallet[]" placeholder="targetWallet">

        <button type="button" class="btn btn-danger" onclick="removeWallet(this)">-</button>
        <button type="button" class="btn btn-success" onclick="addWallet('')">+</button>

    </div>`;

    $("#sendMultiWalletContainer").append(field);
}

function addMode3Wallet(address) {

    let field = `<div class="input-group">

        <div class="input-group-prepend">
            <span class="input-group-text">Token Contract</span>
        </div>

        <input type="text" class="form-control tokensArrayMonitor" value="${address}" name="tokensArrayMonitor[]" placeholder="TokenContract">

        <button type="button" class="btn btn-danger" onclick="removeMode3Wallet(this)">-</button>
        <button type="button" class="btn btn-success" onclick="addMode3Wallet('')">+</button>

    </div>`;

    //$("#block-one-mode-three").append(field);
    $("#tokensArrayDiv").append(field);
}

function addressCheck(address) {

    if (address.length == 42) {
        return true;
    } else console.log("wallet error..");

    return false;

}

function tokenContractCheck(address) {

    if (address.length >= 42) {
        return true;
    } else console.log("token contract error..");

    return false;

}

function writeToScreen(message) {
    if (typeof (message) == 'string') {
        const regex = /\[\d\dm/ig;
        let newm = message.replace(regex, ' ');
        console.log(newm)
        output.scrollTop = output.scrollHeight;
    }
}

function conditions(currency) {

    let presaleCurency = $("#presaleCurency").val();
    let choseBlockChain = $("#blockChainSelect").val();
    
   
    let choseMethode = $("#choseMethode").val();
    let choseMode = $("#modeSelect").val();
    let selectedTokenCurency = $('#exchangeToken').val();
    if (currency != null || currency != undefined) {
        selectedTokenCurency = currency;
    }


    let selectedMarket = $('#marketSelect').val();
    let transferToken = $('#transferToken').val();
    let utilAction = $('#utilAction').val();
    if (choseBlockChain == 1) {
        $("#QuickNodeMainNetBSC").show();
        $("#QuickNodeMainNetETH").hide();
        $("#QuickNodeMainNetPOLY").hide();
        $("#QuickNodeMainNetCRONOS").hide();

        $("#marketSelect").empty();
        $('#marketSelect').append('<option value="1" selected>PancakeSwap</option>');
        $('#marketSelect').append('<option value="2" >ApeSwap</option>');

        $("#exchangeToken").empty();
        if (choseMethode == 1) {
            $('#exchangeToken').append('<option value="1" selected>BNB</option>');
        } else {
            $('#exchangeToken').append('<option value="1" selected>WBNB</option>');
        }
        $('#exchangeToken').append('<option value="2" >BUSD</option>');
        $('#exchangeToken').append('<option value="3" >USDT</option>');
        $('#exchangeToken').append('<option value="4" >USDC</option>');

        if (utilAction == 3) {
            $("#transferToken").empty();
            $('#transferToken').append('<option value="1" >WBNB</option>');
            $('#transferToken').append('<option value="2" >BUSD</option>');
            $('#transferToken').append('<option value="3" >USDT</option>');
            $('#transferToken').append('<option value="4" >USDC</option>');
        } else {
            $("#transferToken").empty();
            $('#transferToken').append('<option value="1" selected>TOKEN</option>');
            $('#transferToken').append('<option value="2" >BNB</option>');
            $('#transferToken').append('<option value="3" >WBNB</option>');
            $('#transferToken').append('<option value="4" >BUSD</option>');
            $('#transferToken').append('<option value="5" >USDT</option>');
            $('#transferToken').append('<option value="6" >USDC</option>');
        }


        if (choseMethode == 1) {
            hideContractSwap();
            disableModes('ALL');
            enableModes(['scanModeSelected', 'presaleModeSelected', 'snipeModeSelected', 'frontrunnModeSelected', 'detectNewContractsModeSelected', 'trackContractCallsModeSelected', 'utilitiesModeSelected']);
            if (choseMode == 1) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2          
                showPresale();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#start_on_telegram_container').show();
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                showFrontrunn();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                showTrackAndSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else if (choseMode == 8) {
                hideAll();
                $('#TokenContractDiv').show();
                $('#tokenScanInfoArea').show();
                $('#mode8TextDiv').show();
                
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                $('#start_on_telegram_container').show();
                showSnipe();
            }
        } else if (choseMethode == 2) {
            hideContractSwap();
            showContractBSC();
            disableModes('ALL');
            enableModes(['snipeModeSelected', 'detectNewContractsModeSelected', 'trackContractCallsModeSelected', 'utilitiesModeSelected']);
            if (choseMode == 1) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                $('#start_on_telegram_container').show();
                showSnipe();
            } else if (choseMode == 2) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                $('#start_on_telegram_container').show();
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                showSnipe();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                showTrackAndSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                $('#start_on_telegram_container').show();
                showSnipe();
            }
        } else if (choseMethode == 3) {
            hideContractSwap();
            showContractBSC();
            disableModes('ALL');
            enableModes(['snipeModeSelected', 'frontrunnModeSelected', 'detectNewContractsModeSelected', 'trackContractCallsModeSelected', 'utilitiesModeSelected']);
            if (choseMode == 1) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                $('#start_on_telegram_container').show();
                showSnipe();
            } else if (choseMode == 2) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                $('#start_on_telegram_container').show();
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                showFrontrunn();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                showTrackAndSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                if(utilAction == 1){
                    hideAll();
                    $('#utilAction').val(1);
                    $('#tokenInfoArea').show();  // token info container on mode 2
                    $('#transferToken').val(transferToken);
                    showUtilities();                    
                }else{
                    hideAll();
                    $('#utilAction').val(1);
                    $('#tokenInfoArea').show();  // token info container on mode 2
                    $('#transferToken').val(transferToken);
                    showUtilities();                         
                }
              
            } else {
                hideAll();               
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else {

        }
    } else if (choseBlockChain == 2) {
        $("#QuickNodeMainNetBSC").hide();
        $("#QuickNodeMainNetETH").show();
        $("#QuickNodeMainNetPOLY").hide();
        $("#QuickNodeMainNetCRONOS").hide();
     
       
        $("#marketSelect").empty();
        $('#marketSelect').append('<option value="1" selected>Uniswap</option>');
        $('#marketSelect').append('<option value="2" selected>SushiSwap</option>');

        $("#exchangeToken").empty();
        if (choseMethode == 1) {
            $('#exchangeToken').append('<option value="1" selected>ETH</option>');
        } else {
            $('#exchangeToken').append('<option value="1" selected>WETH</option>');
        }
        $('#exchangeToken').append('<option value="2" >USDT</option>');
        $('#exchangeToken').append('<option value="3" >USDC</option>');
        $('#exchangeToken').append('<option value="4" >DAI</option>');


        if (utilAction == 3) {
            $("#transferToken").empty();
            $('#transferToken').append('<option value="1" >WETH</option>');
            $('#transferToken').append('<option value="2" >USDT</option>');
            $('#transferToken').append('<option value="3" >USDC</option>');
            $('#transferToken').append('<option value="4" >DAI</option>');
        } else {
            $("#transferToken").empty();
            $('#transferToken').append('<option value="1" selected>TOKEN</option>');
            $('#transferToken').append('<option value="2" selected>ETH</option>');
            $('#transferToken').append('<option value="3" >WETH</option>');
            $('#transferToken').append('<option value="4" >USDT</option>');
            $('#transferToken').append('<option value="5" >USDC</option>');
            $('#transferToken').append('<option value="6" >DAI</option>');
        }
        disableModes('ALL');
        enableModes(['snipeModeSelected', 'detectNewContractsModeSelected', 'trackListingUniswapModeSelected', 'utilitiesModeSelected']);
        
        if (choseMethode == 1) {
            hideContractSwap();
            if (choseMode == 1) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                showTrUniswap();
            }
        } else if (choseMethode == 2) {
            hideContractSwap();
            showContractETH();
            if (choseMode == 1) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else if (choseMethode == 3) {
            hideContractSwap();
            showContractETH();
            if (choseMode == 1) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else {

        }
        
    } else if (choseBlockChain == 3) {
        $("#QuickNodeMainNetBSC").hide();
        $("#QuickNodeMainNetETH").hide();
        $("#QuickNodeMainNetPOLY").show();
        $("#QuickNodeMainNetCRONOS").hide();

        $("#marketSelect").empty();
        $('#marketSelect').append('<option value="1" selected>QuickSwap</option>');

        $("#exchangeToken").empty();
        $('#exchangeToken').append('<option value="1" selected>MATTIC</option>')


        if (utilAction == 3) {
            $("#transferToken").empty();
            $('#transferToken').append('<option value="1" selected>WATTIC</option>');
            $('#transferToken').append('<option value="2" selected>MATTIC</option>');
        } else {
            $("#transferToken").empty();
            $('#transferToken').append('<option value="1" selected>TOKEN</option>');
            $('#transferToken').append('<option value="2" selected>WATTIC</option>');
            $('#transferToken').append('<option value="3" selected>MATTIC</option>');
        }
        disableModes('ALL');
        enableModes(['snipeModeSelected', 'detectNewContractsModeSelected', 'utilitiesModeSelected']);
        if (choseMethode == 1) {
            hideContractSwap();
            if (choseMode == 1) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 6) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else if (choseMethode == 2) {
            hideContractSwap();
            showContractPOLYGON();
            if (choseMode == 1) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showPresale();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                showFrontrunn();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2  
                showTrackAndSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else if (choseMethode == 3) {
            hideContractSwap();
            showContractPOLYGON();
            if (choseMode == 1) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showPresale();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                showFrontrunn();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2  
                showTrackAndSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else {

        }
    }else if (choseBlockChain == 4) {
        $("#QuickNodeMainNetBSC").hide();
        $("#QuickNodeMainNetETH").hide();
        $("#QuickNodeMainNetPOLY").hide();
        $("#QuickNodeMainNetCRONOS").show();

        $("#marketSelect").empty();
        $('#marketSelect').append('<option value="1" selected>MM Finance</option>');

        $("#exchangeToken").empty();
        $('#exchangeToken').append('<option value="1" selected>CRO</option>')


        if (utilAction == 3) {
            $("#transferToken").empty();
            $('#transferToken').append('<option value="1" selected>WCRO</option>');
        } else {
            $("#transferToken").empty();
            $('#transferToken').append('<option value="1" selected>TOKEN</option>');
            $('#transferToken').append('<option value="2" selected>WCRO</option>');
            $('#transferToken').append('<option value="3" selected>USDT</option>');
        }
        disableModes('ALL');
        enableModes(['snipeModeSelected', 'detectNewContractsModeSelected', 'utilitiesModeSelected']);
        if (choseMethode == 1) {
            hideContractSwap();
            if (choseMode == 1) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 6) {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else if (choseMethode == 2) {
            hideContractSwap();
            showContractPOLYGON();
            if (choseMode == 1) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showPresale();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                showFrontrunn();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2  
                showTrackAndSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else if (choseMethode == 3) {
            hideContractSwap();
            showContractPOLYGON();
            if (choseMode == 1) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showPresale();
            } else if (choseMode == 2) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            } else if (choseMode == 3) {
                hideAll();
                showFrontrunn();
            } else if (choseMode == 4) {
                hideAll();
                showNewCtr();
            } else if (choseMode == 5) {
                hideAll();
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2  
                showTrackAndSnipe();
            } else if (choseMode == 6) {
                hideAll();
                showTrUniswap();
            } else if (choseMode == 7) {
                hideAll();
                $('#transferToken').val(transferToken);
                showUtilities();
            } else {
                hideAll();
                $("#modeSelect").val(2);
                $('#tokenInfoArea').show();  // token info container on mode 2
                $('#tgScraperArea').show(); // telegram scraper on mode 2
                $('#save_container').show(); // snipe on token paste on mode 2
                showSnipe();
            }
        } else {

        }
    } else {

    }
    if (choseBlockChain == 3) {
        $('#marketSelect').val(1);
    } else {
        $('#marketSelect').val(selectedMarket);
    }

    if (currency) {
        $('#exchangeToken').val(currency);
    } else {
        $('#exchangeToken').val(selectedTokenCurency);
    }

    $('#exchangeToken').val(selectedTokenCurency);

    $('#presaleCurency').val(presaleCurency);
    // $('#utilAction').val(utilAction)
}

function hideContractSwap() {
    $('#contractBSC').hide();
    $('#contractETH').hide();
    $('#contractPOLYGON').hide();
}
function showContractBSC() {
    $('#contractBSC').show();
    $('#contractETH').hide();
    $('#contractPOLYGON').hide();
}
function showContractETH() {
    $('#contractBSC').hide();
    $('#contractETH').show();
    $('#contractPOLYGON').hide();
}
function showContractPOLYGON() {
    $('#contractBSC').hide();
    $('#contractETH').hide();
    $('#contractPOLYGON').show();
}

function hideAll() {
    $('#transferBSClabel').hide();
    $('#transferOtherlabel').hide();
    $('#otherGweilabel').hide();
    $('#mode7TextDiv').hide();
    $('#slippage').hide();
    $('#slippage_div').hide();
    $('#mode8TextDiv').hide();
    $('#tokenScanInfoArea').hide();
    //transfer util2
    $('#start_on_telegram_container').hide();
    $('#util2_div').hide();
    $('#token_transfer_div').hide();
    $('#wallet_text').hide();
    $('#swap_text').hide();
    $('#swap_text2').hide();
    $('#investedAmount').hide();
    $('#bscGwei').hide();
    $('#otherGwei').hide();
    $('#sellbscGwei').hide();
    $('#sellotherGwei').hide();

    // general fields
    $('#utilitiesMode_Div').hide();
    $('#utilSelect_div').hide();
    $('#snipePresale_div').hide();
    $('#snipePresale').hide();
    $('#priceOutput').hide(); // price output container mode 2
    $('#tokenInfoArea').hide();  // token info container on mode 2
    $('#tgScraperArea').hide(); // telegram scraper on mode 2
    $('#save_container').hide(); // snipe on token paste on mode 2

    // presale fileds (mode1)
    $('#presalePlatformDiv').hide(); // select presale platform
    $('#presaleFields').hide(); // presale address     
    $('#TokenContractDiv').hide(); //TokenContract common to mode 1,2,5
    $('#hasWhiteList').hide();
    $('#hasStartedPresale').hide();
    $('#curencyAndAmount').hide();
    $('#presaleGasGwei').hide();
    $('#claimTokens_div').hide();// presale fileds (mode1 toggle to claim tokens)

    $('#snipeOnWalletCall').hide();   //toggle snipe on wallet call

    // snipe fileds (mode2)
    $('#etherAmount').hide(); //amount to buy with
    //$('#devWallet').hide(); 
    $("#ownerWalletDiv").hide();
    // snipe fileds (mode2 toggle snipe on function and input function name)
    $('#snipeFunctionToggleDiv').hide();
    $('#sellFunctionDiv').hide();
    $('#sellFunctionHashDiv').hide();
    
    $('#snipeExactTokens_div').hide();
   
    
    $('#snipeListingFromUnicrypt_div').hide()
    $('#functionHash').hide();
    $('#blockDelayDiv').hide();

    // snipe fileds (mode2 toggle auto gwei, snipe/buy, buy gwei, buy gasLimit and multiBuy Transctions)
    $('#snipeBuyAutoMultiTrDiv').hide();

    //snipe fileds (mode2 with contract to wallet and send to multi wallets)
    $('#sendMultiWalletTogle').hide();
    $('#sendMultiWalletContainer').hide();

    //approve togle
    $('#toggleAndApprove').hide();
    $('#needApproval').hide();
    $('#btn_after').hide();
    $('#btn_before').hide();

    //instant sell 
    $('#instantSellDiv').hide();
    $('#instantSell').hide();
    $('#sellAuto').hide();
    $('#proffitClass').hide();
    $('#proffitXinput').hide();
    $('#sellWithDelay').hide();
    $('#antiBot').hide();
    $('#btn_auto').hide();
    $('#btn_manual').hide();
    $('#withProffit').hide();

    // frontrunn mode 3 fields:
    $('#tokensArrayDiv').hide();
    $('#amountFrontrunDiv').hide();
    $('#frontrunnMinTxDiv').hide();

    // text div:
    $('#mode4TextDiv').hide();
    $('#mode6TextDiv').hide();
    $('#snipeOnWalletCallDiv').hide();

       //temporary disable ethereum contract for this update
     

 
}

function disableModes(modes) {
    //to disable some send array with modes id, ex:
    //disableModes(['presaleModeSelected','snipeModeSelected']);
    let modesArray = ['scanModeSelected', 'presaleModeSelected', 'snipeModeSelected', 'frontrunnModeSelected', 'detectNewContractsModeSelected', 'trackContractCallsModeSelected', 'trackListingUniswapModeSelected', 'utilitiesModeSelected'];
    if (modes !== 'ALL') {
        modesArray = modes;
    }
    modesArray.forEach(mode => {
        document.getElementById(mode).setAttribute("disabled", "disabled");
    });
}

function enableModes(modes) {
    modes.forEach(mode => {
        document.getElementById(mode).removeAttribute("disabled");
    });
}

function showPresale() {
    $('#snipePresale').show();
    $('#snipePresale_div').show();
    $('#tgScraperArea').hide();
    $('#presalePlatformDiv').show(); // select presale platform
    $('#presaleFields').show(); // presale address     
    $('#TokenContractDiv').show(); //TokenContract common to mode 1,2,5
    $('#hasWhiteList').show();
    $('#hasStartedPresale').show();
    if ($('#presalePlatformSelect').val() == 2) {
        $('#hasWhiteList').hide();
    } else {
    }

    $('#presaleSarted').show();
    $('#curencyAndAmount').show();
    $('#presaleGasGwei').show();
    $('#claimTokens_div').show();// presale fileds (mode1 toggle to claim tokens)
    if ($('#claimTokens').is(':checked')) {
        //approve togle
        showApprove();
        showSell();  // show sell fields

    } else {
        $('#toggleAndApprove').hide();
        hideSell();
    }
}

function showFrontrunn() {
    $('#tokensArrayDiv').show();
    $('#amountFrontrunDiv').show();
    $('#frontrunnMinTxDiv').show();
}

function showNewCtr() {
    $('#mode4TextDiv').show();
}

function hideNewCtr() {
    $('#mode4TextDiv').hide();
}

function showTrUniswap() {
    $('#mode6TextDiv').show();
}

function hideTrUniswap() {
    $('#mode6TextDiv').hide();
}

function showTokenAndOwner() {
    $('#TokenContractDiv').show(); //TokenContract common to mode 1,2,5
    $("#ownerWalletDiv").show();
   // $('#snipeListingFromUnicrypt_div').show();
    if($('#modeSelect').val() == 2){
        if ($('#snipeListingFromUnicrypt').is(':checked')) {
        
            $('#presaleWallet_txt').show();
            $('#ownerWallet_txt').hide();
        } else {
          
            $('#presaleWallet_txt').hide();
            $('#ownerWallet_txt').show();
        }
    }else{
        $('#snipeListingFromUnicrypt_div').hide();
        $('#presaleWallet_txt').hide();
        $('#ownerWallet_txt').show();
    }
   
   /*  $("#snipeListingFromUnicrypt_div").show();
    $("#snipeListingFromUnicrypt").show(); */
    
}

function showTrackAndSnipe() {
    showTokenAndOwner();
    $('#tgScraperArea').hide();
    $('#snipeOnWalletCallDiv').show();   //toggle snipe on wallet call
    $('#snipeOnWalletCall').show();   //toggle snipe on wallet call
    if ($('#snipeOnWalletCall').is(':checked')) {
        $('#etherAmount').show(); //amount to buy with
        if ($("#choseMethode").val() == 1) {
            showApprove();
        } else {
            hideApprove();
        }
        showBuy();
        showSell();
    } else {
        $('#etherAmount').hide(); //amount to buy with
        hideBuy();
        hideSell();
    }


}

function showSell() {
    //instant sell 
    $('#instantSellDiv').show();
    $('#instantSell').show();
    if($('#blockChainSelect').val() == 1 || $('#blockChainSelect').val() == 4){
        
        $('#bscGwei').show();
        $('#sellbscGwei').show();
        $('#sellotherGwei').hide();
    }else{


        $('#sellbscGwei').hide();
        $('#sellotherGwei').show();
    }
    if ($('#instantSell').is(':checked')) {
        $('#sellAuto').show();
        $('#btn_manual').show();
        $('#btn_auto').show();
        if ($('#btn_auto').is(':checked')) {
            $('#sellWithDelay').show();
            $('#priceOutput').hide(); // price output container mode 2 
            $('#proffitClass').hide();
        } else {
            $('#sellWithDelay').hide();
            $('#priceOutput').show(); // price output container mode 2
            $('#withProffit').show();
            $('#proffitClass').show();
            if ($('#withProffit').is(':checked')) {
                $('#proffitXinput').show();
            } else {
                $('#proffitXinput').hide();
            }
        }
        $('#antiBot').show();
    } else {
        $('#antiBot').hide();
    }
    $('#sellFunctionDiv').show();
    if ($('#sellOnfunction').is(':checked')) {
        $('#sellFunctionHashDiv').show();
    }else{
        $('#sellFunctionHashDiv').hide();
    }
    
}

function hideSell() {
    //instant sell 
    $('#instantSellDiv').hide();
    $('#instantSell').hide();
    $('#sellAuto').hide();
    $('#btn_manual').hide();
    $('#btn_auto').hide();
    $('#sellWithDelay').hide();
    $('#withProffit').hide();
    $('#proffitClass').hide();
    $('#proffitXinput').hide();



}

function showBuy() {
    $('#blockDelayDiv').show();
    $('#snipeExactTokens_div').show();
    if($("#snipeExactTokens").is(':checked')){
        $('#buyExactAmount').show();  
        $('#buyWithEther').hide(); 
    }else{
        $('#buyExactAmount').hide(); 
        $('#buyWithEther').show();  
    }
    $('#slippage_div').show();
    $('#slippage').show();
    $('#snipeBuyAutoMultiTrDiv').show();
    if($("#choseMethode").val() != 1){        
        $('#snipeWithEther_Div').hide();
    }else{
        $('#snipeWithEther_Div').show();
    }
}

function hideBuy() {
    $('#blockDelayDiv').hide();
    $('#snipeBuyAutoMultiTrDiv').hide();
}

function showSnipe() {

    let choseMethode = $("#choseMethode").val();

    showTokenAndOwner();
    $('#etherAmount').show(); //amount to buy with
    $('#snipeFunctionToggleDiv').show();
   

    if ($('#snipefunction').is(':checked')) {
        $('#functionHash').show();
    } else {
        $('#functionHash').hide();
    }
    if ($("#snipeExactTokens").is(':checked')) {
        $('#buyWithEther').hide();
        $('#buyExactAmount').show();
    } else {
        $('#buyWithEther').show();
        $('#buyExactAmount').hide();
    }
    if($('#blockChainSelect').val() == 1 || $('#blockChainSelect').val() == 4){
        $('#bscGwei').show();
        $('#otherGwei').hide();
        $('#sellbscGwei').show();
        $('#sellotherGwei').hide();
       // $('#snipeListingFromUnicrypt_div').show()
    }else{
        $('#snipeListingFromUnicrypt_div').hide()
        $('#bscGwei').hide();
        $('#otherGwei').show();
        $('#sellbscGwei').hide();
        $('#sellotherGwei').show();
    }
    showBuy();
    if (choseMethode == 1) {
        showApprove();
        $('#sendMultiWalletTogle').hide();
        $('#sendMultiWalletContainer').hide();
        showSell();
    } else if (choseMethode == 2) {
        $('#toggleAndApprove').hide();
        $('#sendMultiWalletTogle').show();
        if ($('#sendMultiWallet').is(':checked')) {
            $('#sendMultiWalletContainer').show();
            hideSell();
            $('#multipleBuyTr').hide();
            
        } else {
            $('#sendMultiWalletContainer').hide();
            $('#multipleBuyTr').show();
            if ($('#instantSell').is(':checked')) {
                showApprove();
            } else {
                hideApprove();
            }
            showSell();
        }
    } else {
        $('#toggleAndApprove').hide();
        $('#sendMultiWalletTogle').hide();
        $('#sendMultiWalletContainer').hide();
        showSell();
    }

}

function showApprove() {
    if ($("#choseMethode").val() != 1 && $("#choseMethode").val() != 2) {
        $('#toggleAndApprove').hide();
        $('#needApproval').hide();
}else{
    $('#toggleAndApprove').show();
    $('#needApproval').show();
    if ($('#needApproval').is(':checked')) {
        $("#sw_needApproval").show();
        $("#btn_after").show();
        $("#btn_before").show();
        if ($("#btn_after").is(':checked')) {
            $("#btn_before").prop('checked', false);
        } else {
            $("#btn_after").prop('checked', false);
            $("#btn_before").prop('checked', true);
        }
    } else {
        $("#sw_needApproval").hide();
    }
}
}

function hideApprove() {
    $('#toggleAndApprove').hide();
    $('#needApproval').hide();
    $("#sw_needApproval").hide();
}

function startOnTelegram() {
    console.log("start on telegram");

    //1. save settings 
    tg_wait_for_contract = true;

    //disable and color change 'start on telegram' btn
    $("#start_on_telegram").removeClass('btn btn-outline-success').addClass('btn btn-danger');
    $('#start_on_telegram').attr('disabled', 'disabled');

    //disable and color change 'start on token paste' btn
    //$("#save_btn").removeClass('btn btn-outline-success').addClass('btn btn-danger');
    $('#save_btn').attr('disabled', 'disabled');
    $('#start_bot_btn').attr('disabled', 'disabled');

    //2. tokencontract value = "Waiting for telegram to post contract!"
   /*  $("#TokenContract").val("Waiting for telegram to post contract!");
 */
    //3. start bot
    startBoTg();
}

function showUtilities() {
    $('#utilitiesMode_Div').show();
    $('#utilSelect_div').show();
    if ($("#choseMethode").val() != 1 && $("#choseMethode").val() != 2) {
        $('#utilAction').val(1);
        showUtil1();
        document.getElementById('transfer').setAttribute("disabled", "disabled");
        document.getElementById('addCurency').setAttribute("disabled", "disabled");
        document.getElementById('withdrawToken').setAttribute("disabled", "disabled");
        document.getElementById('unstuck').setAttribute("disabled", "disabled");
        
    } else {
        if ($("#choseMethode").val() == 1) {
            document.getElementById('transfer').removeAttribute("disabled");
            document.getElementById('addCurency').removeAttribute("disabled");
            document.getElementById('withdrawToken').removeAttribute("disabled");
            document.getElementById('unstuck').removeAttribute("disabled");
        } else if ($("#choseMethode").val() == 2) {
            if ($('#utilAction').val() != 1 && $('#utilAction').val() != 4) {
                $('#utilAction').val(1);
                showUtil1();
                document.getElementById('transfer').setAttribute("disabled", "disabled");
                document.getElementById('addCurency').setAttribute("disabled", "disabled");
                document.getElementById('withdrawToken').removeAttribute("disabled");
                document.getElementById('unstuck').removeAttribute("disabled");
            } else {
                document.getElementById('transfer').setAttribute("disabled", "disabled");
                document.getElementById('addCurency').setAttribute("disabled", "disabled");
                document.getElementById('withdrawToken').removeAttribute("disabled");
                document.getElementById('unstuck').removeAttribute("disabled");
            }

        }else if ($("#choseMethode").val() == 3) {
            if ($('#utilAction').val() != 1) {
                $('#utilAction').val(1);
                showUtil1();
                document.getElementById('transfer').setAttribute("disabled", "disabled");
                document.getElementById('addCurency').setAttribute("disabled", "disabled");
                document.getElementById('withdrawToken').removeAttribute("disabled");
                document.getElementById('unstuck').removeAttribute("disabled");
            } else {
                document.getElementById('transfer').setAttribute("disabled", "disabled");
                document.getElementById('addCurency').setAttribute("disabled", "disabled");
                document.getElementById('withdrawToken').removeAttribute("disabled");
                document.getElementById('unstuck').removeAttribute("disabled");
            }
        }

    }
    if ($('#utilAction').val() == 1) {
        showUtil1();
    } else {
        hideUtil1();
    }

    if ($('#utilAction').val() == 2) {
        showUtil2();
    } else {
        //hideUtil2();
    }

    if ($('#utilAction').val() == 3) {
        showUtil3();
    } else {
        //hideUtil3();
    }

    if ($('#utilAction').val() == 4) {
        showUtil4();
    } else {
        //hideUtil3();
    }
    
    if ($('#utilAction').val() == 5) {
        $('#mode7TextDiv').show();
    } else {
        $('#mode7TextDiv').hide();
    }

    

}

function showUtil1() {
    $('#investedAmount').show();
    $('#buyWithEther').hide();
    $('#buyExactAmount').hide();
    $('#tokenInfoArea').show();
        showTokenAndOwner()
    $('#etherAmount').show();
    if ($("#choseMethode").val() != 3) {
        showApprove();
    }
    showSell();
    $('#slippage_div').hide();
}

function hideUtil1() {
    $('#tokenInfoArea').hide();
    $('#TokenContractDiv').hide();
    $('#etherAmount').hide();
    if ($("#choseMethode").val() != 3) {
        hideApprove();
    }
    hideSell();
}

function showUtil2() {
    $('#util2_div').show();
    $('#wallet_text').show();
    $('#transfer_ammount_div').show();
    if ($("#transferToken").val() == 1) {
        $('#token_transfer_div').show();
    } else {
        $('#token_transfer_div').hide();
    }
    if($("#blockChainSelect").val() == 1){
        $('#transferBSClabel').show();
        $('#transferOtherlabel').hide();
        $('#otherGweilabel').hide();
    }else{
        $('#transferBSClabel').hide();
        $('#transferOtherlabel').show();
        $('#otherGweilabel').show();
    }

}


function hideUtil2() {
    $('#util2_div').hide();
}

function showUtil3() {
    $('#util2_div').show();
    $('#swap_text').show();
    $('#transfer_ammount_div').show();
    if($("#blockChainSelect").val() == 1){
        $('#transferBSClabel').show();
        $('#transferOtherlabel').hide();
        $('#otherGweilabel').hide();
    }else{
        $('#transferBSClabel').hide();
        $('#transferOtherlabel').show();
        $('#otherGweilabel').show();
    }
}


function hideUtil3() {
    $('#util2_div').hide();
}

function showUtil4() {
    $('#util2_div').show();
    $('#transfer_ammount_div').hide();
    $('#swap_text').hide();
    $('#token_transfer_div').show();
    $('#swap_text2').show();
    if($("#blockChainSelect").val() == 1){
        $('#transferBSClabel').show();
        $('#transferOtherlabel').hide();
        $('#otherGweilabel').hide();
    }else{
        $('#transferBSClabel').hide();
        $('#transferOtherlabel').show();
        $('#otherGweilabel').show();
    }
}


function hideUtil4() {
    $('#util2_div').hide();
}


