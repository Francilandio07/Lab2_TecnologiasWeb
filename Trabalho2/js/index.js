// Constantes que representam divs do jogo
const board = document.getElementById("ground") //armazena a referência do que será o chão
const style = document.documentElement.style //recebe a referência do arquivo css
const sky = document.getElementById("sky") //armazena a referência do que será o céu
const gameover = document.getElementById("gameover") //armazena a referência da tela de game over
const menu = document.getElementById("menu") //armazena a referência da tela de menu
const game = document.getElementById("game") //armazena a referência da tela de jogo

// Variáveis para armazenar componentes dinâmicos e suas quantidades
let cars = [] //Array para armazenar os carros oponentes
let car //Variável para armazenar o carro do player
let stars = [] //Array para armazenar as estrelas
let cones = [] //Array para armazenar os cones
let gasolines = [] //Array para armazenar as gasolinas
let nitros = [] //Array para armazenar os nitros
let num_gasolines = 0//Para armazenar o numero de abastecimentos feitos e mostrar no fim do jogo

//Variáveis relacionadas a pista
let path = document.querySelector('path') //Armazena a referência ao elemento que dá forma à pista
let x = 4750; //Para posicionar a ponta da pista no centro da tela (horizontalmente)
let direction = -8; //Para controlar a direção da curva e velocidade

//Variável e constante para velocidades
const min_velocity = -2 //Constante que indica a velocidade minima de afastamento entre o player e os carros
const max_velocity = -5 //Constante que indica a velocidade maxima de afastamento entre o player e os carros
let velocity = -3.5 //Genuinamente controla a velocidade dos carros oponentes, mas serve de referencia para a dos objetos "estáticos"

let xp = 610 //Posição inicial x do player

//Variáveis para armazenar e controlar placares e ranking
let placar //Objeto para armazenar o placar
let ranking //Objeto para armazenar o ranking
let velocimeter //Objeto para armazenar a velocidade
let points = 0 //Variável que armazena os pontos do player
let overtaken_cars = 0 //Armazena o número de carros ultrapassados
let energy //Objeto para armazenar a energia
let start_energy = 0 //Variável que guarda a energia inicial
let current_energy = 0 //Variável que guarda a energia atual
let is_running = false //variável para impedir que a função de incremento ou decremento de velocidade seja chamada no mesmo momento em que estiver executando


//Trecho referente a escolha de cenários
let cards = document.querySelectorAll('.card'); //Seleção de todas os objetos de classe card para armazenar em cards

// Adicionar um evento de clique a cada card
cards.forEach(function(card) {
  card.addEventListener('click', function() {
    // Remover a classe 'selected' de todos os cards
    cards.forEach(function(card) {
      card.classList.remove('selected');
    });
    
    // Adicionar a classe 'selected' ao card clicado
    this.classList.add('selected');
    //Verificar pelo id que card foi selecionado para atribuir as características do cenário respectivo
    switch(this.id){
      case "1": //Selecionou Cenário de neve
        sky.className = "sky-snow" //adiciona as caracteríscas do céu
        board.className = "snow" //adiciona as caracteríscas do chão
        document.getElementById('nevoa').style.display = "block" //Dá um efeito de névoa na cena, mas não para o player ou objetos coletáveis
      break
      case "2": //Selecionou Cenário diário
        sky.className = "sky-day"
        board.className = "natural"
      break
      case "3": //Selecionou Cenário noturno
        sky.className = "sky-night"
        board.className = "night"
        document.getElementById('escuridao').style.display = "block" //Dá um efeito de escuridão na cena, mas não para o player ou objetos coletáveis
      break
      case "4":
        sky.className = "sky-cerracao" //adiciona as caracteríscas do céu
        board.className = "cerracao" //adiciona as caracteríscas do chão
        document.getElementById('cerracao').style.display = "block" //Dá um efeito de blur na cena, mas não para o player ou objetos coletáveis
      break
    }
  });
});

// =====================================Controle de regras e animações do jogo===============================================================================

//Função para verificar se o player está a frente do oponente (object)
function inFront(player, object) {
  const a = player.getBoundingClientRect() //pega os atributos relativos a posição do player na tela
  const b = object.getBoundingClientRect() //pega os atributos relativos a posição do oponente na tela
  const vertical = a.top + a.height < b.top //verifica se o topo mais altura do player é menor que o topo do oponente, ou seja, se o player está a frente

  return vertical //retorna true se o player está a frente e false se não
}

//Função para atualizar o ranking do player
function onOvertaking(player, objects){ //objects será o array que armazena as instâncias dos carros oponentes
  let overtook = false //booleano que indica se o carro ultrapassou algum oponente

  objects.forEach(object => { //itera sobre as instâncias de oponentes na cena
    overtook = inFront(player.element, object.element) //usa a função inFront para verificar se o player está a frente do oponente corrente
    //detecta a ultrapassagem do player ao oponente
    if(overtook && !object.element.overtaken){ //verifica se o player está a frente e se o carro não está marcado como ultrapassado (através de seu booleano overtaken)
      overtaken_cars += 1 // se o player está a frente e o oponente não está marcado como ultrapassado, incrementa o número de carros ultrapassados
      object.element.overtaken = true //e marca o oponente atual como ultrapassado
    }
    //detecta a ultrapassagem do oponente ao player
    else if(!overtook && object.element.overtaken){ //verifica se o oponente está a frente do player e está marcado como ultrapassado
      overtaken_cars -= 1 //se o oponente está a frente e marcado como ultrapassado, decrementa o número de carros ultrapassados
      object.element.overtaken = false //e marca o oponente como não ultrapassado
    }
  })
  ranking.update(overtaken_cars) //atualiza o ranking do player
}

//Função para detecção de colisão entre pares (player e objeto)
function overlapping(player, object) {
  const a = player.getBoundingClientRect() //variável que recebe os atributos de posição do player
  const b = object.getBoundingClientRect() //variável que recebe os atributos de posição do objeto (pode ser oponente, ou algum dos objetos estáticos)
  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left //verifica se os objetos estão sobrepostos horizontalmente
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top //verifica se os objetos estão sobrepostos verticalmente

  return horizontal && vertical // retorna o estado de sobreposição, será verdadeiro se os objetos se sobrepõem horizontal e verticalmente
}

//Função para detectar colisão em lote (player e classe de objeto)
function onCollision(player, objects){ //objects é um array que armazena as instâncias de determinada classe de objetos na cena
  let collided = false //indica se houve colisão
  objects.forEach(object => { //itera sobre cada objeto no array
      if (!collided) { //verifica se não houve colisão
        collided = overlapping(player.element, object.element) //atualiza o estado de collided verificando a colisão entre o player e o objeto corrente através da função overlapping
        if(collided && !(object.element.className == 'car')) //verifica se houve colisão e a classe do objeto é de qualquer objeto estático
        {
          board.removeChild(object.element) //remove/destrói a instância do objeto na cena
        }
      }
  })

  return collided //retorna o estado atual de colisão
}

//Função para controlar a velocidade dos carros e objetos do jogo
function velocityHandler(decrease, offroad){ //decrease é booleano e indica se é pra diminuir a velocidade do player, starting indica se é o início do jogo
  if (is_running) {
    // a função já está em execução, não faz nada
    return;
  }
  is_running = true

  if(decrease && offroad){
    
    velocity += 0.01 //quando o carro está fora da pista, sua velocidade é reduzida de 15%
    velocity = Math.min(min_velocity, velocity)
    velocimeter.update(velocity) //atualiza a velocidade marcada no velocímetro
  }
  else if(decrease && !offroad){ //diminui a velocidade do player ao colidir com oponentes
    velocity += 0.5
    velocity = Math.min(min_velocity, velocity)
    velocimeter.update(velocity) //atualiza a velocidade marcada no velocímetro
  }
  else if(!decrease && !offroad){ //indica que o player aumenta a velocidade, o que ocorre quando ele pega nitro
    velocity -= 0.3 //faz com que os carros tenham a velocidade aumentada em termos de aproximação ao player (no caso velocidade do player ultrapassá-los)
    velocity = Math.max(max_velocity, velocity)
    velocimeter.update(velocity)
  }
  is_running = false //indica que a função pode ser chamada novamente, essa é uma forma de impedir a modificação da velocity mais de uma vez ao mesmo tempo
  
}

//Função de controle da energia do player
function changeEnergy(value){ //value é o tanto que a energia vai incrementar ou decrementar
  if(current_energy < start_energy + 1 && current_energy >= 0){ //verifica se a energia corrente é menor que a inicial + 1 e se é maior ou igual a 0
    current_energy += value // se sim, então modifica a energia corrente incrementando de value unidades (value será negativo e essa operação será um decremento)
  }
  else if(current_energy < 0){ //verifica se a energia corrente é menor que 0
    //Pegando as referencias das divs filhas da tela do game over
    gameover.querySelector('.pontos').appendChild(placar.element) 
    gameover.querySelector('.pontos').appendChild(placar.img)
    gameover.querySelector('.posicao').appendChild(ranking.element)
    gameover.querySelector('.posicao').appendChild(ranking.img)
    gameover.querySelector('.reabastecimento').innerHTML = num_gasolines

    //Mexendo na posição de cada elemento do placar, ranking e abastecimentos mostrados na tela de game over
    placar.element.style.right = "600px"
    placar.element.style.top = "350px"
    placar.img.style.top = "365px"
    placar.img.style.right = "538px"

    ranking.element.style.position = "absolute"
    ranking.img.style.position = "absolute"

    ranking.element.style.left = "45%"
    ranking.element.style.top = "70%"
    ranking.img.style.top = "73%"
    ranking.img.style.left = "52%"

    game.style.display = "none" //se sim, a tela do jogo é desativada
    gameover.style.display = "flex" //e a tela do game over ativada, sendo assim encerrado o jogo
    document.querySelector('.container').removeChild(game)
  }
  else if(current_energy >= start_energy){ //verifica se a energia corrente é maior ou igual ao valor inicial
    current_energy = start_energy //se sim, a energia corrente deve ser igual a inicial, isso para que não haja mais incrementos (A energia máxima acumulada é o valor da energia inicial)
  }
  energy.child.style.height = current_energy + "px" //atribui a energia atual fazendo a altura da barra interna ser modificada 
}

//Função para destruir os objetos que passam do player para que o cenário não fique muito sobrecarregado
function destroyObjects(player, objects){ //objects será o array que armazena as instâncias de algum dos objetos estáticos

  objects.forEach(object => { //itera sobre as instâncias de objetos na cena
    overtook = inFront(player.element, object.element) //usa a função inFront para verificar se o player está a frente do objeto
    //detecta a ultrapassagem do player ao objeto sem colidir
    if(overtook){ //verifica se o player está a frente do objeto
      board.removeChild(object.element)  //remove o objeto da cena
    }
  })
}

//Função de animação da Curva
function Curve() {
  x += direction*Math.abs(velocity); // x é atualizada de acordo com direção e velocidade definidas em direction
  let cloud_velocity = Math.abs(0.8*direction) //calcula a velocidade das nuvens
  style.setProperty("--cloud_velocity", cloud_velocity.toString()+"s") //atribui a velocidade da animação da nuvem

  //decisão da direção da curva
  if(x > 9500 && x != 4750){
    direction = -direction
    style.setProperty('--cloud_from', '1200px') //define de que extremo da tela as nuvens partem
    style.setProperty('--cloud_to', '-500px') //define a que extremo da tela as nuvens vão
  }
  if(x < 0 && x != 4750){
    direction = -direction
    style.setProperty('--cloud_from', '-500px')
    style.setProperty('--cloud_to', '100%')
    
  }
  if( x == 4750){
    direction = Math.random() < 0.5 ? -direction : direction //para deixar as curvas randomicas a direção é escolhida de modo aleatorio a cada vez que termina de animar
  }
  //Atribui a coordenada x da ponta da estrada para dar o efeito de curva
  path.setAttribute('d', 'M '+x+' 0 C 6931 4531 7675 6174 9500 10800 C 6300 10800 3100 10800 0 10800 C 1876 6702 3085 3724 '+x+' 0z');


 requestAnimationFrame(Curve) //chamada recursiva da animação da curva
}

// =====================================Especificações/criações de objetos===============================================================================

//Cria novos elementos com base na tag e classe passadas como parâmetros
function newElement(tagName, className){
    let element = document.createElement(tagName) //coloca em element o objeto criado de tag "tagName"
    element.className = className // adiciona a classe
    return element //retorna o objeto
}

// ---------------------------------------Objetos estáticos na tela------------------------------------------------------------------------------

//Para criar o objeto placar
function gamePoints(){
  this.element = newElement('span', 'progress')
  this.img = newElement('img', 'star')
  this.img.src = 'imgs/star.png' //o ícone é uma estrela
  this.img.style.right = "20px" //posiciona a direita 
  this.img.style.top = "28px" //posiciona no topo
  this.img.style.zIndex = 100 //camada de profundidade
  sky.appendChild(this.img) //faz a instância do ícone ser filha da div do céu
  this.update = points => { //Função de atualização dos pontos
    this.element.innerHTML = points+"x" //para mostrar na tela a quantidade atual de pontos
  }
  this.update(0) //inicializa os pontos mostrados em 0
}

//Para criar o objeto velocímetro
function velocityMeasure(){
  this.element = newElement('span', 'velocimeter')
  sky.appendChild(this.element) //faz a instância do ícone ser filha da div do céu
  this.update = velocity => { //Função de atualização dos pontos
    this.element.innerHTML = Math.floor(Math.abs(20*velocity))+"Km/h" //para mostrar na tela a quantidade atual de pontos
  }
  this.update(velocity) //inicializa os pontos mostrados em 0
}

//Para criar o objeto ranking
function positionRanking(){
  this.element = newElement('span', 'ranking')
  this.img = newElement('img', 'car')
  this.img.src = 'imgs/car.png' //o ícone é a imagem de um carro
  this.img.style.right = "1040px" //posiciona o ícone na esquerda da tela
  this.img.style.top = "28px" //posiciona o ícone no topo da tela
  this.img.style.backgroundColor = "rgb(41, 179, 23)" //atribui a cor do ícone
  this.img.style.zIndex = 100 // camada de profundidade 
  sky.appendChild(this.img) // faz o icone ser filho da div do céu
  this.update = overtaken_cars => { //Para atualizar a quantidade de carros ultrapassados pelo player (ranking)
    this.element.innerHTML = overtaken_cars+"x"//para mostrar na tela a quantidade atual de carros ultrapassados
  }
  this.update(0) //inicializa o ranking em 0, pois todos os carros estão na frente do player no início
}

//Para criação da barra de energia
function energyBar(){
  this.element = new newElement("div", "barextern") //cria uma div como barra externa
  board.appendChild(this.element) //adiciona a barra como filha do chão
  this.child = new newElement("div", "barintern") //cria uma div como barra interna
  this.element.appendChild(this.child) //adiciona a barra interna como filha da externa
  this.element.style.position = "absolute" //a barra com posição absoluta
  this.element.style.right = "30px" //posição a direita da tela
  this.element.style.bottom = "90px" //posição relativa a borda inferior 
  this.element.style.height = "300px" //altura da barra externa
  this.child.style.position = "absolute" //posição absoluta da barra interna
  this.child.style.bottom = "0" 
  start_energy = 300 //A enerigia inicial é 300 porque é o valor da altura da barra externa em px 
  current_energy = start_energy //a energia corrente inicia com o mesmo valor da inicial
}

// ---------------------------------------Objetos dinâmicos da cena------------------------------------------------------------------------------

//Para criação dos objetos de carros oponentes
function carEnemy(){
    this.element = newElement('img', 'car') //Usa a função de criar objetos, passando a tag img de classe car
    this.element.src = 'imgs/car.png' //adiciona a imagem do carro
    this.velocity = velocity //variável para armazenar a velocidade dessa instância de carro, com base na velocidade "global"
    this.y_pos = 1000 + 100*Math.random() //posicionamento inicial no eixo vertical, calculado aleatoriamente e sempre fora da visão do player
    //define a cor do carro de modo aleatório
    this.element.style.backgroundColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
    this.overtaken = false //indica se o carro foi ultrapassado pelo player (true)

    this.scale = 1 //controla a escala do objeto para dar impressão de aproximação e afastamento
    
    let height_bound = board.getBoundingClientRect().bottom - board.getBoundingClientRect().top //Pega o tamanho da div do chão
    this.element.style.bottom = "1px" //Para definir 

    //Função para animar o carro, atualizando suas características a cada frame
    this.animate = () => {
      this.bottom_value = parseInt(this.element.style.bottom) //Pega a posição atual em relação a borda inferior da tela
      this.velocity = velocity //Atualiza a velocidade

      let svgPoint = path.ownerSVGElement.createSVGPoint(); //cria um ponto na pista
      let point = path.getPointAtLength(1); //pega as coordenadas da "ponta" da pista
      svgPoint.x = point.x; //a coordenada x do ponto criado passa a ser a mesma do x da ponta da pista
      svgPoint.y = point.y; //a coordenada y do ponto criado passa a ser a mesma do y da ponta da pista
      let position = svgPoint.matrixTransform(path.getScreenCTM()); //position terá as mesmas coordenadas do ponto criado mas em relação a página

      this.left = position.x - 10

      //Se o carro está entre os limites verticais da div do chão, altera a escala para dar o efeito de aproximação e afastamento
      if(this.bottom_value < height_bound && this.bottom_value > 0){
        this.scale = (height_bound - this.bottom_value)/height_bound //A escala é mínima quando o carro está perto do topo do chão e máxima quando está perto da base
      }
      
      this.y_pos += this.velocity //Atualiza a posição vertical em relação a tela (eixo z na visão do player) de acordo com a velocidade atual

      this.element.style.height = this.scale * 40 + "px" //Atribui a altura do carro
      this.element.style.width = this.scale * 60 + "px" //Atribui a largura do carro
      this.element.style.bottom = this.y_pos + "px" //Atribui a posição vertical
      this.element.style.left = this.left + "px" //Atribui a posição horizontal
      requestAnimationFrame(this.animate) //Chama a animação do carro recursivamente
    }

}

//Função para instanciar os carros oponentes
function spawnCar(){
  const min_x = 400 //mínimo valor da coordenada x
  const max_x = 800 //máximo valor da coordenada x
  let x_pos = Math.floor(Math.random() * (max_x - min_x)) + min_x //calcula randomicamente a coordenada inicial x do carro cujo valor está entre mínimo e máximo definidos
  this.element = new carEnemy() //instancia o novo carro 
  this.element.element.style.left = x_pos + "px" //atribui sua coordenada x inicial
  cars.push(this.element) //adiciona essa instância de carro ao array cars
}

//Para a criação do carro do player
function carPlayer(){
    this.element = newElement('img', 'player')
    this.element.src = 'imgs/car.png'
    this.element.style.left = "610px" //Atribui a coordenada inicial x
    this.element.style.bottom = "1px" //Atribui a distância a borda inferior da tela
    this.element.style.backgroundColor = "red" //atribui a cor
    this.element.style.zIndex = '100'

    //Função de animação do player
    this.start = () =>
    { 
      let path_rect = path.getBoundingClientRect(); //pegar os valores do path (estrada) de modo que seja possível acessar sua posição de acordo com a pagina
      let player_rect = this.element.getBoundingClientRect(); //pegar os valores de posição do player na tela

      //verificar se o player está na pista
      if (player_rect.left >= path_rect.left &&
          player_rect.right <= path_rect.right &&
          player_rect.top >= path_rect.top &&
          player_rect.bottom <= path_rect.bottom) {
        console.log("dentro")
      } else { //se está fora da pista sua velocidade é reduzida de 15% a cada segundo nessa situação
        velocityHandler(true, true)
      }
      
      //desttrói objetos que não mais irão interagir com o player
      destroyObjects(this, cones)
      destroyObjects(this, gasolines)
      destroyObjects(this, nitros)
      destroyObjects(this, stars)
      onOvertaking(this, cars) //Verifica os carros ultrapassados atualmente pelo player
      changeEnergy(-0.08) //Faz o decremento da energia do player a cada momento do jogo
      if(onCollision(this, cars)){ //Verifica se há colisão entre o player e algum oponente
        console.log("Diminui velocidade car")
        velocityHandler(true, false) //se há colisão, diminui a velocidade do player
      }
      if(onCollision(this, stars)){ //Verifica se há colisão entre player e alguma estrela
        placar.update(++points) //se há colisão, incrementa a quantidade de pontos
      }
      if(onCollision(this, cones)){ //Verifica se há colisão entre o player e algum cone
        placar.update(--points) //se há colisão, decrementa a quantidade de pontos
      }
      if(onCollision(this, gasolines)){ //Verifica se há colisão entre o player e algum galão de gasolina
        changeEnergy(20) //se  há colisão, incrementa a quantidade de energia 
        num_gasolines += 1 //incrementa o número de abastecimentos
      }
      if(onCollision(this, nitros)){ //Verifica se há colisão entre o player e algum nitro
        velocityHandler(false, false) //se há colisão, então incrementa a velocidade do player 
      }
      requestAnimationFrame(this.start) //chama recursivamente a animação do player
    }
}

// ---------------------------------------Objetos estáticos na cena------------------------------------------------------------------------------

//Para criar as instãncias dos objetos estáticos
function staticObjects(type){ //type é uma string que define o tipo de objeto a ser criado
    this.height = 40 //define a altura do objeto em sua escala normal (se não for nitro)
    this.width = 60 //define a largura do objeto em sua escala normal (se não for nitro)
    switch(type){ //verificação do tipo
      case 'star':
        this.element = newElement('img', 'star')
        this.element.src = 'imgs/star.png'
        stars.push(this)
      break
      case 'cone':
        this.element = newElement('img', 'cone')
        this.element.src = 'imgs/cone.png'
        this.element.style.zIndex = '0'
        cones.push(this)
      break
      case 'gasoline':
        this.element = newElement('img', 'gasoline')
        this.element.src = 'imgs/gasoline.png'
        gasolines.push(this)
      break
      case 'nitro':
        this.element = newElement('img', 'nitro')
        this.element.src = 'imgs/nitro.png'
        this.height = 60 //se o objeto a criar é nitro, sua altura normal é 60px
        this.width = 30 //se o objeto a criar é nitro, sua largura normal é 30px
        nitros.push(this) //adiciona a instância no array de nitros
      break
    }
    
    this.y_pos = 1000 + 100*Math.random() //calcula a posição vertical inicial randomicamente e de modo que esteja fora da visão do player

    this.scale = 1 //variável para modificar a escala sendo possível simular afastamento e aproximação do obejto em relação ao player
    
    let height_bound = board.getBoundingClientRect().bottom - board.getBoundingClientRect().top //pega a limitação vertical do chão
    const min_x = 400 //minimo da coordenada x
    const max_x = 800 //máximo da coordenada x
    let xpos = Math.floor(Math.random() * (max_x - min_x)) + min_x //calcula a coordenada x do objeto de modo randomico cujo valor está entre mínimo e máximo definidos

    this.element.style.left = xpos + "px" //Atribui o valor inicial da coordenada x calculada


    this.animate = () => {
      this.bottom_value = parseInt(this.element.style.bottom) //pega o valor atual da posição vertical do objeto
      if(velocity > 0){ //verifica se a velocidade global é positiva, o que indica que a velocidade dos oponentes é maior que do player
        this.velocity = -Math.abs(velocity)*0.3 // se sim, a velocidade dos objetos é reduzida para dar impressão de que o playe estã devagar
      }
      else if(velocity < 0){ //verifica se a velocidade do player é maior que a dos oponentes
        this.velocity = -Math.abs(velocity)*1.2 //se sim, a velocidade de aproximação dos objetos deve ser maior que a dos oponentes, para dar a sensação de que estão parados
      }
      

      if(this.bottom_value < height_bound && this.bottom_value > 0){//verifica se a posição vertical do objeto está dentro dos limites da atura da div do chão
        this.scale = (height_bound - this.bottom_value)/height_bound //se sim, a escala é modificada de modo que é máxima quando o objeto está perto da borda inferior e mínima quando está próximo da borda superior
      }
      
      this.y_pos += this.velocity //modifica a posição do objeto

      this.element.style.height = this.scale * this.height  + "px" //atribui a altura de acordo com a escala
      this.element.style.width = this.scale * this.width + "px" //atribui a largura de acordo com a escala
      this.element.style.bottom = this.y_pos + "px" //atribui a posição vertical
      requestAnimationFrame(this.animate)   //chama recursivamente a função de animação
    }

}

// =====================================Funções de povoamento da cena===============================================================================

//Função para popular a cena com carros oponentes
function populateCars(){
  //Define o intervalo de tempo em que os carros aparecem na cena
  setTimeout(() =>{
    let car = new spawnCar() //através de spawncar gera o novo carro
    board.appendChild(car.element.element) //adiciona a nova instância como filho do objeto do chão
    requestAnimationFrame(car.element.animate) //inicializa a animação do carro
    populateCars() //Chama recursivmente a função de popular os carros
  }, 4000);
} 

//Função para popular a cena com estrelas
function populateStars(){
  setTimeout(() =>{ //intervalo de tempo para instanciar uma nova estrela
    let star = new staticObjects('star') //cria a instância através da função staticObjects indicando type = 'star'
    board.appendChild(star.element) //adiciona a instância como filha do chão
    requestAnimationFrame(star.animate) //inicia a animação da estrela      
    populateStars() //chama recursivamente a função populateStars
  }, 5000);
}
//idêntica a função populateStars
function populateCones(){
  setTimeout(() =>{
    let cone = new staticObjects('cone')
    board.appendChild(cone.element)
    requestAnimationFrame(cone.animate)     
    populateCones()
  }, 10000);
}

//idêntica a função populateStars
function populateGasolines(){
  setTimeout(() =>{
    let gasoline = new staticObjects('gasoline')
    board.appendChild(gasoline.element)
    requestAnimationFrame(gasoline.animate)
    populateGasolines()
  }, 8000);
}

//idêntica a função populateStars
function populateNitros(){
  setTimeout(() =>{
    let nitro = new staticObjects('nitro')
    board.appendChild(nitro.element)
    requestAnimationFrame(nitro.animate)
    populateNitros()
  }, 5000);
}

// =====================================Funções para controle do estado do jogo===============================================================================

//Função para iniciar o jogo, que é chamada quando o botão "Iniciar" é clicado
function startGame(){
  car = new carPlayer() //cria a instâcia do player
  board.appendChild(car.element) //atribui a instância do player como filho do chão

  placar = new gamePoints() //cria a instância do placar  
  ranking = new positionRanking() //cria a instância do ranking

  energy = new energyBar() //cria a instância da barra de energia
  velocimeter = new velocityMeasure()

  sky.appendChild(placar.element) //adiciona a instância do placar aos filhos do céu (ou seja, parte superior da tela)
  sky.appendChild(ranking.element) //adiciona a instância do ranking aos filhos do céu

  car.start() //inicia a animação do player
  populateCars() //chama a função de instanciar oponentes
  populateStars() //chama a função de instanciar estrelas
  populateCones() //chama a função de instanciar cones
  populateGasolines() //chama a função de instanciar galões de gasolinas
  populateNitros() //chama a função de instanciar nitros

  Curve() //inicia a animação da curva

  menu.style.display = "none" //faz o menu sumir
  game.style.display = "flex" //faz a tela de jogo aparecer
}

window.addEventListener("keydown", function(event){ //para receber os inputs
    let key = event.key //instância da tecla pressionadaS
    
    switch(key){ //verifica que tecla foi pressionada
        case "d":
            xp += 10 //move o player pra direita se a tecla é "d"
        break
        case "a":
            xp -= 10 //move o player pra esquerda se a tecla é "a"
        break
    }
    if(car)
      car.element.style.left = xp + "px"
})
