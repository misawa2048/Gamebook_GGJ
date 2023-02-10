var g_items=[];
var g_stackArr=[];
var g_sceneId=0;
var g_se = null;
var g_imgDisp=true;
var g_imgLink=false;

_onload = async function(){
    var sttSceneId=0;
    let vars = getVarsFromParams();
    var rowStr="";
    if(vars["apikey"]!=undefined) g_apiKey = vars["apikey"];
    if(vars["page"]!=undefined) sttSceneId = Math.max(parseInt(vars["page"])-1,0);
    if(vars["debug"]!=undefined) g_isDebug = (vars["debug"]=="true");
    if(vars["img"]!=undefined) g_imgDisp = (vars["img"]=="true");
    if(vars["imglink"]!=undefined) g_imgLink = (vars["imglink"]=="true");
    if(vars["row"]!=undefined) rowStr = vars["row"];

    let sheetName = (vars["sheet"]!=undefined) ? vars["sheet"]:DEF_SHEET_NAME;

    if(g_imgDisp){
        let imgEle = document.getElementById("iImgDiv");
        imgEle.innerHTML=`<img src="${LOGO_IMG}" class="cMaskImgSq cFadeIn">`;
    }
    let apiUri = API_POINT+g_apiKey+"/exec?sheet="+sheetName;
    if(rowStr!=""){
        apiUri+="&row="+rowStr;
    }
    try{
        let data = await loadData(apiUri);
        g_items = data.items;
        for(var i=0;i<g_items.length;++i){
            g_items[i].labelId = i; // labelId(=ronNo-2)を付けておく
        }
        reset(sttSceneId);
    }catch{
        let txtEle = document.getElementById("iMainTxtDiv");
        var txt = '<a href="https://github.com/misawa2048/Gamebook_GGJ#readme" target="_">Set your Deployment_ID</a>';
        txt += '<br>e.g.<br>./gamebook/index.html?apikey=[YOUR_DEPLOYMENT_ID]';
        txtEle.innerHTML=txt;
    }
}

reset = function(_sttSceneId=0){
    g_sceneId=_sttSceneId;
    g_se = null;
    g_stackArr = [];
    chgScene(g_sceneId,true);
}

const getVarsFromParams = function(){
    var params = location.search.substring(1).split('&');
    var vars = {}; 
    for(var i = 0; i < params.length; i++) {
        var keySearch = params[i].search(/=/);
        var key = '';
        if(keySearch != -1) key = params[i].slice(0, keySearch);
        var val = params[i].slice(params[i].indexOf('=', 0) + 1);
        if(key != '') vars[key] = decodeURI(val);
    } 
    return vars; 
}

loadData = async function(_uri){
    let response = await fetch(encodeURI(_uri));
    if (response.ok) {
        let result = await response.json();
        console.log("OK: ");
        return result;
    } else {
        console.log("HTTP-Error: " + response.status);
    }
}

setData = function(_rowDataJson){
    if(g_imgDisp){
        let imgEle = document.getElementById("iImgDiv");
        let imgUrl=_rowDataJson.image;

        let params={"alt":"画像"};
        try{ params = JSON.parse(_rowDataJson.params); }catch(e){}
        var imgHtml=`<img src="${imgUrl}" alt="${params.alt}" class="cMaskImgSq cFadeIn"></img>`;
        if(g_imgLink){
            let ImgLinkFunc = function(_img){ return `https://memeplex.app/v/${_img}`; };
            let imgName = _rowDataJson.image.split('/').slice(-1)[0]; // 最後の/以降
            let imgLinkUri=ImgLinkFunc(imgName);
            imgHtml = `<a href="${imgLinkUri}" target="_">`+imgHtml+"</a>";
        }
        imgEle.innerHTML=imgHtml;
    }
    
    let txtEle = document.getElementById("iMainTxtDiv");
    let taggedTxt = _rowDataJson.text.replace('\n','<br>');
    txtEle.innerHTML=`<div>${taggedTxt}</div>`;
    //console.log(_rowDataJson.text);
    setButtons(_rowDataJson);

    let pageEle = document.getElementById("iPageNoDiv");
    pageEle.innerHTML=`<i aria-hidden="true">-- ${_rowDataJson.labelId+2} --</i>`; // sheetのrowNo

    var se = _rowDataJson.se;
    if((MUTE_SE!="")&&(se=="")){
        se = MUTE_SE;
    }
    if(se!=""){
        g_se?.pause();
        let seAudio = new Audio(se);
        seAudio?.play();
        g_se = seAudio;
    }
}

setButtons = function(_rowDataJson){
    let selEle = document.getElementById("iMainSelDiv");
    selEle.innerHTML="";
    let buttonsTxt = _rowDataJson.buttons.replace('\n','');
    let buttonStrArr = buttonsTxt.split('}');
    for(var i=0;i<buttonStrArr.length;++i){
        let txtLnkArr = buttonStrArr[i].split('{'); // ex: 森へ,1
        if(txtLnkArr.length>=2){
            let retId = getRetId(txtLnkArr[1],_rowDataJson.labelId);
            if(retId>=0){
                setButtonOne(selEle,txtLnkArr[0],retId);
            }
        }
    }
    if(g_isDebug && (g_stackArr.length>0)){
        setButtonOne(selEle,"← BACK",-1);
    }
}
setButtonOne = function(_parentEle,_text,_nextScene){
    let btnEle = document.createElement("button");
    btnEle.classList.add("cSelBtn");
    btnEle.classList.add("cFadein");
    btnEle.type="button";
    btnEle.innerHTML=`<div class="cBtnTxt">${_text}</div>`; //.replace('<br>','\n');
    btnEle.addEventListener("click",()=>{ chgScene(_nextScene); });
    _parentEle.appendChild(btnEle);
}

getRetId=function(_lavelOrRow,_labelId){
    var ret = -1;
    let no = parseInt(_lavelOrRow);
    if(!isNaN(no)){
        ret = no-2; // rowは1始まり且つ1行目はタイトルラベルになっているので
    }else if(_lavelOrRow=="++"){
        return _labelId+1;
    }else {
        for(var i=0;i<g_items.length;++i){
            if(g_items[i].label==_lavelOrRow){
                ret = i;
                break;
            }
        }
    }
    return ret;
}

chgScene=function(_sceneId, _noStack=false){
    if((_sceneId==-1)&&(g_stackArr.length>0)){ // 戻る
        let data = g_stackArr.pop();
        chgScene(data.id,true);
    }
    else if(_sceneId>=0){
        setData(g_items[_sceneId]);
        document.getElementById('iHeadDiv').focus();

        if(!_noStack){
            g_stackArr.push({id:g_sceneId});
        }
        g_sceneId = _sceneId;
    }
    if(g_isDebug){
        let dbgEle = document.getElementById("iDebugDiv");
        var str="";
        g_stackArr.forEach(element => {
           str += `${element.id+1}-`;
        });
        str += `${g_sceneId+1}`;
        dbgEle.innerHTML=str;
    }
}