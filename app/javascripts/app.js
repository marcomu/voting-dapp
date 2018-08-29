import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import consensus_artifacts from '../../build/contracts/Consensus.json'
window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


let Consensus = contract(consensus_artifacts);

let candidates = {}

let tokenPrice = null;

window.voteForCandidate = function(candidate) {
 let candidateName = $("#candidate").val();
 let voteTokens = $("#vote-tokens").val();
 $("#vote-tokens").val("");


 Consensus.deployed().then(function(contractInstance) {
  contractInstance.voteForCandidate(candidateName, voteTokens, {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
   let div_id = candidates[candidateName];
   $("#msg").html("El voto ha sido emitido, se verá reflejado una vez que se registre en el blockchain.");
   $("#msg").show();
   return contractInstance.totalVotesFor.call(candidateName).then(function(result) {
    $("#" + div_id).html(result.toString());
   });
  });
 });
}


window.buyTokens = function() {
 let tokensToBuy = $("#buy").val();
 let price = tokensToBuy * tokenPrice;


  $("#msg").show();
  $("#msg").html("Orden procesada, por favor espera");
 
 Consensus.deployed().then(function(contractInstance) {
  contractInstance.buyTokens({value: web3.toWei(price, 'ether'), from: web3.eth.accounts[0]}).then(function(v) {
    web3.eth.getBalance(contractInstance.address, function(error, result) {
      $("#contract-balance").html(web3.fromWei(result.toString()) + " Ether");
    });
  })
 });
 init();
}

window.lookupVoterInfo = function() {
 let address = $("#voter-info").val();
 Consensus.deployed().then(function(contractInstance) {
  contractInstance.details.call(address).then(function(v) {

   $("#tokens-bought").html("Total tokens comprados: " + v[0].toString());
   let votesPerCandidate = v[1];
   $("#votes-cast").empty();
   $(".votes-results").removeClass('d-none');
   $(".votes-results").addClass('d-block');
   $("#votes-cast").append("Votos por candidato: <br>");
   let allCandidates = Object.keys(candidates);
   for(let i=0; i < allCandidates.length; i++) {
    $("#votes-cast").append(allCandidates[i] + ": " + votesPerCandidate[i] + "<br>");
   }
  });
 });
}

window.cashOut = function(){
  Consensus.deployed().then(function(contractInstance) {
    contractInstance.cashOut({from: web3.eth.accounts[0]}).then(function(v) {
    $("#msg").html("Fondos retirados");
    $("#msg").show()
    });
  });

}

function listProposals() {
 Consensus.deployed().then(function(contractInstance) {
  contractInstance.proposalList.call().then(function(candidateArray) {
   for(let i=0; i < candidateArray.length; i++) {
    candidates[web3.toUtf8(candidateArray[i])] = "candidate-" + i;
   }
   setupCandidateRows();
   populateCandidateVotes();
   init();
  });
 });
}

function populateCandidateVotes() {
 let candidateNames = Object.keys(candidates);
 for (var i = 0; i < candidateNames.length; i++) {
  let name = candidateNames[i];
  Consensus.deployed().then(function(contractInstance) {
   contractInstance.totalVotesFor.call(name).then(function(v) {
    $("#" + candidates[name]).html(v.toString());
   });
  });
 }
}

function setupCandidateRows() {
 Object.keys(candidates).forEach(function (prop) { 
  $("#prop-rows").append("<tr><td>" + prop + "</td><td id='" + candidates[prop] + "'></td></tr>");
  $("#candidate").append("<option value='"+prop+"'>" + prop + "</option>");
 });
}

function init() {
  Consensus.deployed().then(function(contractInstance) {
    contractInstance.tokens.call().then(function(result) {
      $("#total").html(result.toString());
    });
    contractInstance.sold.call().then(function(result) {
      $("#sold").html(result.toString());
    });
    contractInstance.tokenPrice.call().then(function(result) {
    tokenPrice = parseFloat(web3.fromWei(result.toString()));
      $("#cost").html(tokenPrice + " Ether");
    });
    web3.eth.getBalance(contractInstance.address, function(error, result) {
      $("#balance").html(web3.fromWei(result.toString()) + " Ether");
    });
  });
}


$(document).ready(function() {
  Consensus.setProvider(web3.currentProvider);
  listProposals();
});