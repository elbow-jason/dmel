var fs = require('fs');
var path = require('path');

var getFilesArray = function(relPath){

  this.relPath        = relPath;
  this.filePath       = path.join(__dirname+ relPath);
  this.fileList       = fs.readdirSync(this.filePath);
  this.fileData       = [];

  this.dataPush = function(data){
    this.fileData.push(data);
  }

  this.dataGet = function(){
    for (eachFile in this.fileList){ 
      this.dataPush(  readFunc(this.filePath , this.fileList[eachFile]));
    }
  };
  
  var readFunc = function(dirPath,filename){
    var content;
    var checker = filename;

    content = fs.readFileSync(dirPath + filename, 'utf8');
    return content;
  };

  this.makeFileDict = function(){
    this.fileObj = {};
    for (var i = this.fileList.length - 1; i >= 0; i--) {
      this.fileObj[this.fileList[i]] = this.fileData[i];
    }
  };
  this.initialize = function(){
    this.dataGet();
    this.makeFileDict();
  };
};





var SeqMatcher = function(){
  this.splits       = [],
  this.sitesRaw     = [],
  this.matches      = [],
  this.sites        = [];
  this.regExp;

  this.regExp = new RegExp(/placeholder/);
  
  this.setregExp = function(newRegExp){
    this.regExp = newRegExp;
  };


  this.getSplits  = function(seq){
    this.splits   = seq.split(this.regExp);
  };


  this.getsitesRaw = function(seq){
    currentSite = 1;
    for (i in this.splits){
      currentSite += this.splits[i].length;
      this.sitesRaw.push(currentSite);
    }
    this.sitesRaw.splice(this.sitesRaw.length-1,1);
  };

  this.getMatches = function(seq){
    this.matches = seq.match(this.regExp);
  };

  this.getActualSites = function(lengthToCut){
    this.sites =  parseInt(this.sitesRaw) + parseInt(lengthToCut);
  };


  this.initialize = function(newRegExp, seq){
    this.setregExp(newRegExp);
    this.getMatches(seq);
    this.getSplits(seq);
    this.getsitesRaw(seq);
  };

};



var Gene = function(geneSeq, geneName){
  this.geneSeq    = geneSeq;
  this.geneName   = geneName;
  this.donor      = new SeqMatcher;
  this.acceptor   = new SeqMatcher;



};





var addGene = function(geneObject, newGene){
  geneObject[newGene.geneName] = newGene;
};

dpp = {};
dpp.files = new getFilesArray('/orig_files/');
dpp.files.initialize();

dpp.organisms = ['dmel', 'dpsu', 'dsim', 'dvir'];

for (key in dpp.files.fileList){
  var name      = dpp.organisms[key];
  var seq       = dpp.files.fileObj[dpp.files.fileList[key]];
  addGene(dpp, new Gene(seq, name));
}

//regex generated using rubular.com regex exitor (THE BEST REGEX thing ever.)

//donor and acceptor sequences based on IMGT descriptions of donors and acceptors
//URL : http://www.imgt.org/IMGTeducation/Aide-memoire/_UK/splicing/

var donorRE = /[AC][A][G][G][T][AG][A][G][T]/;
var acceptorRE = /[CT]{6}[G][CT]{2,4}[G][CT]{0,4}[ATGC][TC][A][G]{1,3}/;

//drosophila promotoers were designed using ucsd model found at 
// URL : http://labs.biology.ucsd.edu/Kadonaga/DCPD.htm
// initiator info from http://en.wikipedia.org/wiki/Initiator_element
// initiator 


var initializeAllGenes = function(donorRE, acceptorRE){
  for (key in dpp.organisms){
    var organism = dpp.organisms[key];
    dpp[organism].donor     .initialize(donorRE ,    dpp[organism].geneSeq);
    dpp[organism].acceptor  .initialize(acceptorRE , dpp[organism].geneSeq);

  }
};

initializeAllGenes(donorRE, acceptorRE);





// fine tune the regexs for each organism


var setREeasy = function(organism, sitechoice, regex){
  dpp[organism][sitechoice].initialize(regex, dpp[organism].geneSeq);
};


var donor                   = 'donor',
    acceptor                = 'acceptor',
    donorCutSiteRE          = /AGGTG/,
    acceptorCutSiteRE       = /CAG/,
    altAcceptor             = /[A][CT]{2}[A][CT]{6}[ATGC][TC][A][G][G]/;


setREeasy('dpsu', 'acceptor', altAcceptor);
setREeasy('dsim', 'acceptor', altAcceptor);


var calcSites = function(sitechoice, regex, differential){
  var match, 
      lengthToCut, 
      organism;

  for (key in dpp.organisms){
    organism      = dpp.organisms[key];
    match         = dpp[organism][sitechoice].matches[0].split(regex);
    lengthToCut   = match[0].length;
    dpp[organism][sitechoice].getActualSites(parseInt(lengthToCut)+differential);
  }
};



calcSites(donor,    donorCutSiteRE,     1);
calcSites(acceptor, acceptorCutSiteRE,  1);






var printSite = function(organism, sitechoice, spacer){
  var siteword = sitechoice + spacer;

  console.log(organism + " " + siteword);
  console.log("sitesRaw " + dpp[organism][sitechoice].sitesRaw        );
  console.log("sites    " + dpp[organism][sitechoice].sites           );
  console.log("match    " + dpp[organism][sitechoice].matches + "\n " );


};


var printAllSites = function(){
  for (key in dpp.organisms){
    var organism      = dpp.organisms[key],
        exon3Start    = dpp[organism].acceptor.sites + 1,
        exon2End      = dpp[organism].donor.sites - 1;

    console.log("************************ \n ");
    console.log(organism + " exon 2 ends at   " + exon2End);
    printSite(organism, donor, '   ');
    printSite(organism, acceptor, '');
    console.log(organism + " exon 3 starts at " + exon3Start + "\n ");
  }
};

printAllSites();

debugger;

