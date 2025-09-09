/// <reference types="cypress" />

import { format, prepareLocalStorage} from '../support/utils'

// cy.viewports
// arquivos de config
// configs por linha de  comando

context('Dev Finances Agilizei', () => {

    //hooks
    // trechos de codigo que serao executados antes e depois dos testes
    // before - antes de todos os testes
    // beforeEach - antes de cada um dos testes
    // after - depois de todos os testes
    // afterEach - depois de cada um dos testes

    beforeEach(() => {
        cy.visit('https://devfinance-agilizei.netlify.app', {
            onBeforeLoad: (win) => {
                prepareLocalStorage(win)
            }
        }) //entrar na pagina

        // cy.get('#data-table tbody tr').should('have.length', 0) // id + elemento + elemento
    });

    //cenarios
    it('Cadastrar entradas', () => {
        // entender o fluxo manualmente
        // mapear os elementos que vamos interagir
        // descrever as interações com o cypress
        // adicionar as asserções necessárias

        cy.get('#transaction .button').click() //id + classe
        cy.get('#description').type('Mesada') // id
        cy.get('[name=amount]').type(12) //  atributos
        cy.get('[type=date]').type('2021-08-17') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor

        cy.get('#data-table tbody tr').should('have.length', 3) // id + elemento + elemento
        
    });

    it('Cadastrar saidas', () => {

        cy.get('#transaction .button').click() //id + classe
        cy.get('#description').type('Mesada') // id
        cy.get('[name=amount]').type(-12) //  atributos
        cy.get('[type=date]').type('2021-08-17') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor

        cy.get('#data-table tbody tr').should('have.length', 3) // id + elemento + elemento
    });

    it('Remover entradas e saídas', () => {
        // const entrada = 'Mesada'
        // const saida = 'SucoKapo'

        // //adicionar entrada
        // cy.get('#transaction .button').click() //id + classe
        // cy.get('#description').type(entrada) // id
        // cy.get('[name=amount]').type(100) //  atributos
        // cy.get('[type=date]').type('2021-08-17') // atributos
        // cy.get('button').contains('Salvar').click() // tipo e valor

        // //adicionar saida
        // cy.get('#transaction .button').click() //id + classe
        // cy.get('#description').type(saida) // id
        // cy.get('[name=amount]').type(-35) //  atributos
        // cy.get('[type=date]').type('2021-08-17') // atributos
        // cy.get('button').contains('Salvar').click() // tipo e valor

        // //remover ambos
        // cy.get('#data-table tbody tr').should('have.length', 2) // id + elemento + elemento

        // estrategia 1: usar o contains para encontrar o elemento e avançar para o pai e depois para o td img attr
        cy.get('td.description') // filtrar antes de usar o contains
            .contains('Mesada')
            .parent() //volta para o pai
            .find('img[onclick*=remove]') //td img attr
            .click()

        // estrategia 2: buscar todos os irmãos e buscar oq ue tem img + attr
        cy.get('td.description') // filtrar antes de usar o contains 
            .contains('Suco Kapo')
            .siblings() //busca os irmãos
            .children('img[onclick*=remove]') //td img attr
            .click()

        cy.get('#data-table tbody tr').should('have.length', 0) // id + elemento + elemento
    });

    it('Validar saldo com diversas transações', () => {
        // const entrada = 'Mesada'
        // const saida = 'SucoKapo'

        // //adicionar entrada
        // cy.get('#transaction .button').click() //id + classe
        // cy.get('#description').type(entrada) // id
        // cy.get('[name=amount]').type(100) //  atributos
        // cy.get('[type=date]').type('2021-08-17') // atributos
        // cy.get('button').contains('Salvar').click() // tipo e valor

        // //adicionar saida
        // cy.get('#transaction .button').click() //id + classe
        // cy.get('#description').type(saida) // id
        // cy.get('[name=amount]').type(-35) //  atributos
        // cy.get('[type=date]').type('2021-08-17') // atributos
        // cy.get('button').contains('Salvar').click() // tipo e valor


        // capturar as linhas com as transações e as colunas com valores
        // capturar os textos dessas colunas
        // formatar os valores das linhas
        // somar as entradas e as saídas

        let income = 0
        let expense = 0

        cy.get('#data-table tbody tr')
            .each(($el, index, $list) => {
                // $el = cada um dos TRs
                // index = indice do elemento
                // $list = lista completa de TRs)
                cy.get($el).find('td.income, td.expense') //filtrar o que interessa
                    .invoke('text') //capturar o texto
                    .then(text =>{
                        //formatar o texto para numero
                        if(text.includes('-')){
                            expense = expense + format(text)
                        }else{
                            income = income + format(text)
                        }
                    })
            })

        //capturar o texto do total
        // comparar o somatorio de entradas com o total
        cy.get('#totalDisplay')
            .invoke('text')
            .then(text => {
                let expectedTotal = income + expense
                let formattedTotalDisplay = format(text)

                expect(formattedTotalDisplay).to.eq(expectedTotal)
            })
            
    });

    it('Validar valor no card de entradas e saidas', () => {
        let income = 0
        let expense = 0

        cy.get('#data-table tbody tr')
            .each(($el, index, $list) => {
                cy.get($el).find('td.income, td.expense') //filtrar o que interessa
                    .invoke('text') //capturar o texto
                    .then(text => {
                    //formatar o texto para numero
                        if(text.includes('-')){
                            expense = expense + format(text)
                        }else{
                            income = income + format(text)
                        }
                    })
            })

        cy.get('#incomeDisplay').invoke('text').then(text => {
            let formattedIncomeDisplay = format(text)

            expect(formattedIncomeDisplay).to.eq(income)
        })

        cy.get('#expenseDisplay').invoke('text').then(text => {
            let formattedExpenseDisplay = format(text)

            expect(formattedExpenseDisplay).to.eq(expense)
        })  
        
    });

    it('Exibir mensagem de erro ao cadastrar transação sem descrição', () => {
        cy.get('#transaction .button').click() //id + classe
        //cy.get('#description').type('Mesada') // id
        cy.get('[name=amount]').type(12) //  atributos
        cy.get('[type=date]').type('2021-08-17') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor
        
    });

    
});