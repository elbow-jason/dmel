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
  this.splits   = [],
  this.sites    = [],
  this.matches  = [],
  this.regExp;

  this.regExp = new RegExp(/placeholder/);
  
  this.setregExp = function(newRegExp){
    this.regExp = newRegExp;
  };


  this.getSplits  = function(seq){
    this.splits   = seq.split(this.regExp);
  };


  this.getSites = function(seq){
    currentSite = 1;
    for (i in this.splits){
      currentSite += this.splits[i].length;
      this.sites.push(currentSite);
    }
    this.sites.splice(this.sites.length-1,1);
  };

  this.getMatches = function(seq){
    this.matches = seq.match(this.regExp);
  };

  this.initialize = function(newRegExp, seq){
    this.setregExp(newRegExp);
    this.getMatches(seq);
    this.getSplits(seq);
    this.getSites(seq);
  };

};



var Gene = function(geneSeq, geneName){
  this.geneSeq = geneSeq;
  this.geneName = geneName;
  this.donor = new SeqMatcher;
  this.acceptor = new SeqMatcher;
};



var donorRE = /[AC][A][G][G][T][AG][A][G][T]/;
var acceptorRE = /[CT]{6}[G][CT]{3}[G][CT]{3}[ATGC][TC][A][G]/;



var addGene = function(geneObject, newGene){
  geneObject[newGene.geneName] = newGene;
};




dpp = {};
dpp.files = new getFilesArray('/orig_files/');
dpp.files.initialize();



dpp.organisms = ['dmel', 'dpsu', 'dism', 'dvir'];

for (key in dpp.files.fileList){
  var name      = dpp.organisms[key];
  var seq       = dpp.files.fileObj[dpp.files.fileList[key]];
  addGene(dpp, new Gene(seq, name));
}

var initializeAllGenes = function(donorRE, acceptorRE){
  for (key in dpp.organisms){
    var organism = dpp.organisms[key];
    dpp[organism].donor     .initialize(donorRE ,    dpp[organism].geneSeq);
    dpp[organism].acceptor  .initialize(acceptorRE , dpp[organism].geneSeq);
  }
};

initializeAllGenes(donorRE, acceptorRE);

debugger;