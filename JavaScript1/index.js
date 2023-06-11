function questao1(entrada){
    if(Array.isArray(entrada)){
        console.log("A entrada é array.");
    }
    else{
        console.log("A entrada não é array.");
    }
}
// =====================================================================================================================
function questao2(original){
    return Array.from(original);
}
// =====================================================================================================================
function questao3(array, n = 1){
    return array.slice(0, n)
}
// =====================================================================================================================
function questao4(array, n = array.length - 1){
    return array.slice(n, array.length)
}
// =====================================================================================================================
function questao5(array){
    return array.join(' - ')
}
let numeros = [34, 56, 66, 90, 37, 21]
let string = questao5(numeros)
console.log("Questão 5: Antes = ["+numeros+"] e Depois = ["+string+"]")
// =====================================================================================================================
function questao6(num) {
    let str = num.toString();
    let result = [str[0]];

    for (let i = 0; i < str.length; i++) {
        if (str[i] % 2 === 0 && str[i+1] % 2 === 0) {
            result.push('-', str[i + 1]);
        }
        else if(str[i] % 2 === 0 && str[i+1] === undefined){
            result.push('-');
        }
        else {
            result.push(str[i+1]);
        }
    }

    return result.join('');
}

let modificacao = questao6(825468);
console.log("Questão 6: "+modificacao); 
// =====================================================================================================================
function questao7(array) {
    let frequency = {};
    let maxFrequency = 0;
    let mostFrequentItem = null;

    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        frequency[item] = (frequency[item] || 0) + 1;

        if (frequency[item] > maxFrequency) {
            maxFrequency = frequency[item];
            mostFrequentItem = item;
        }
    }

    return mostFrequentItem;
}

let myArray = [1, 2, 3, 2, 2, 4, 5];
let result = questao7(myArray);
console.log("Questão 7: ["+myArray+"] Resultado = "+result); // 2
// =====================================================================================================================
function questao8(array) {
    let frequency = {};
    let i = 0
    while(i < array.length) {
        let item = array[i];
        frequency[item] = (frequency[item] || 0) + 1;

        if (frequency[item] >= 2) { 
            array.splice(i, 1);
            i --
        }
        i ++
    }
}

var vetor = [1, 2, 3, 2, 4, 5, 4, 9, 4, 2, 2, 5, 9];
questao8(vetor);
console.log("Questão 8: ["+ vetor + "]"); 

// =====================================================================================================================
function questao9(array1, array2) {
    let result = [];
    let maxLength = Math.max(array1.length, array2.length);

    for (let i = 0; i < maxLength; i++) {
        let value1 = array1[i] || 0;
        let value2 = array2[i] || 0;
        result.push(value1 + value2);
    }

    return result;
}

let vetorA = [1, 2, 4, 7]
let vetorB = [9, 6, 5, 3]

let somaAB = questao9(vetorA, vetorB)

console.log("Questão 9: ["+ vetorA +"] + ["+ vetorB + "] = ["+somaAB+"]")
// =====================================================================================================================
function questao10(pilha, adiciona){
    adiciona.forEach(element => {
        pilha.push(element)
    });
    return pilha
}

let vetorPilha = [1, 2, 3, 4, 5]

let vetorAdiciona = [6, 7, 8, 9, 10]

let resultado = questao10(vetorPilha, vetorAdiciona)

console.log("Questão 10: ["+resultado+"]")