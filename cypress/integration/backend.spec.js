/// <reference types = "cypress" />

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MzQ3NDJ9.ZndXly0j47uB-pJXwmIUoEFULAzVPCqGITtUNtCftG4'

describe('Testes de Api - Seu Barriga Rest', () => {
    beforeEach(() =>  {
        cy.request({
            method: 'POST',
            url: '/signin',
            body:{
                email: "luiz.eduardop@outlook.com",
                senha: "Xyz@123456",
                redirecionar: false
            }
        }).then((resposta) => {
            expect(resposta.status).to.equal(200)
            expect(resposta.statusText).to.equal('OK')
            expect(resposta.body).to.be.not.null
          })
        cy.request({
            method: 'GET',
            url: '/reset',
            headers: {
                authorization: `JWT ${token}`
            }
        }).then((resposta) => {
            expect(resposta.status).to.equal(200)
        })
    })

    context('Conta', () => {
        it('Deve validar a criação de uma conta', () => {
            cy.request({
                method: 'POST',
                url: '/contas',
                headers: {
                    authorization: `JWT ${token}`
                },
                body:{
                    nome: "criado via API"
                }
            }).then((resposta) => {
                expect(resposta.status).to.equal(201)
                expect(resposta.statusText).to.equal('Created')
                expect(resposta.body).to.have.property('nome', 'criado via API')
              })
        })

        it('Deve validar que não é possível cadastrar uma conta com o nome que já existe', () => {
            cy.request({
                method: 'POST',
                url: '/contas',
                headers: {
                    authorization: `JWT ${token}`
                },
                body:{
                    nome: "criado via API"
                },
                failOnStatusCode: false
            }).then((resposta) => {
                expect(resposta.status).to.equal(201)
                expect(resposta.statusText).to.equal('Created')
                expect(resposta.body).to.have.property('nome', 'criado via API')
                cy.request({
                    method: 'POST',
                    url: '/contas',
                    headers: {
                        authorization: `JWT ${token}`
                    },
                    body:{
                        nome: "criado via API"
                    },
                    failOnStatusCode: false
                }).then((resposta) => {
                    expect(resposta.status).to.equal(400)
                    expect(resposta.statusText).to.equal('Bad Request')
                    expect(resposta.body.error).to.equal('Já existe uma conta com esse nome!')
                })
            })
        })

        it('Deve validar que não é possível cadastrar uma conta sem informar o nome', () => {
            cy.request({
                method: 'POST',
                url: '/contas',
                headers: {
                    authorization: `JWT ${token}`
                },
                body:{
                    nome: ""
                },
                failOnStatusCode: false
                    }).then((resposta) => {
                    expect(resposta.status).to.equal(400)
                    expect(resposta.statusText).to.equal('Bad Request')
              })
            })

        it('Deve validar a realização de alteração do nome de uma conta', () => {
            cy.request({
                method: 'GET',
                url: '/contas',
                headers: {
                    authorization: `JWT ${token}`
                },
                qs: {
                    nome: 'Conta para alterar'
                },
                failOnStatusCode: false
                }).then((respostaGet) => {
                    expect(respostaGet.status).to.equal(200)
                    expect(respostaGet.statusText).to.equal('OK')
                    var contaId = respostaGet.body[0].id
                    cy.request({
                        method: 'PUT',
                        url: `/contas/${contaId}`,
                        headers: {
                        authorization: `JWT ${token}`
                        },
                        body: {
                        nome: "Conta criada e alterada via API"
                            },
                        failOnStatusCode: false
                            }).then((respostaPut) => {
                                expect(respostaPut.status).to.equal(200)
                                expect(respostaPut.statusText).to.equal('OK')
                                expect(respostaPut.body).to.have.property('nome', 'Conta criada e alterada via API')
                            })
                    })
            })
    })
    context('Movimentação', () => {
        it('Deve validar o cadastro de movimentação do tipo de Receita já pago', () => {
            cy.request({
                url: '/contas',
                method: 'GET',
                headers: {
                    authorization: `JWT ${token}`
                },
                qs: {
                    nome: 'Conta para movimentacoes'
                },
            }).then((respostaConta) => {
                expect(respostaConta.status).to.equal(200)
                expect(respostaConta.statusText).to.equal('OK')
                let contaId = respostaConta.body[0].id
                cy.request({
                    url: '/transacoes',
                    method: 'POST',
                    headers: {
                        authorization: `JWT ${token}`
                    },
                    body: {
                        conta_id: `${contaId}`,
                        data_pagamento: "01/01/2023",
                        data_transacao: "01/01/2023",
                        descricao: "Venda do Carro",
                        envolvido: "Agência",
                        status: true,
                        tipo: "REC",
                        valor: "50000"
                    },
                    failOnStatusCode: false
                }).then((respostaMovimentacao) => {
                    expect(respostaMovimentacao.status).to.equal(201)
                    expect(respostaMovimentacao.statusText).to.equal('Created')
                    expect(respostaMovimentacao.body.id).to.exist
                })
            })
        })

        it('Deve remover uma movimentação do tipo Receita já pago', () => {
            cy.request({
                url: '/contas',
                method: 'GET',
                headers: { authorization: `JWT ${token}` },
                qs: {
                    nome: 'Conta para movimentacoes'
                },
            }).then((respostaConta) => {
                expect(respostaConta.status).to.equal(200)
                expect(respostaConta.statusText).to.equal('OK')
                let contaId = respostaConta.body[0].id
                let valor = 5000
                cy.request({
                    url: '/transacoes',
                    method: 'POST',
                    headers: { authorization: `JWT ${token}`},
                    body: {
                        conta_id: `${contaId}`,
                        data_pagamento: "04/02/2023",
                        data_transacao: "04/02/2023",
                        descricao: "Venda do Carro",
                        envolvido: "Agência",
                        status: true,
                        tipo: "REC",
                        valor: `${valor}`
                    },
                    failOnStatusCode: false
                }).then((respostaMovimentacao) => {
                    expect(respostaMovimentacao.status).to.equal(201)
                    expect(respostaMovimentacao.statusText).to.equal('Created')
                    expect(respostaMovimentacao.body.id).to.exist
                    let idMovimentacao = respostaMovimentacao.body.id
                    cy.request({
                        url: `https://barrigarest.wcaquino.me/transacoes/${idMovimentacao}`,
                        method: 'DELETE',
                        headers: {
                            authorization: `JWT ${token}`
                        },
                        failOnStatusCode: false
                    }).then((respostaExclusao) => {
                        expect(respostaExclusao.status).to.equal(204)
                        expect(respostaExclusao.statusText).to.equal('No Content')
                    })
                })
            })
        })
    })

    context('Saldo', () => {
        it('Deve validar o saldo de uma conta específica', () => {
            cy.request({
                url: '/contas',
                method: 'GET',
                headers: {
                    authorization: `JWT ${token}`
                },
                qs: {
                    nome: 'Conta para movimentacoes'
                },
            }).then((respostaConta) => {
                expect(respostaConta.status).to.equal(200)
                expect(respostaConta.statusText).to.equal('OK')
                let contaId = respostaConta.body[0].id
                cy.request({
                    url: '/extrato/202302',
                    method: 'GET',
                    headers: {
                        authorization: `JWT ${token}`
                    },
                    qs: {
                        conta_id: `${contaId}`,
                        orderBy: 'data_pagamento'
                    },
                    failOnStatusCode: false
                }).then((respostaMovimentacao) => {
                    expect(respostaMovimentacao.status).to.equal(200)
                    expect(respostaMovimentacao.statusText).to.equal('OK')
                    let valores = respostaMovimentacao.body[0].valor
                    cy.request({
                        url: '/saldo',
                        method: 'GET',
                        headers: {
                            authorization: `JWT ${token}`
                        },
                        failOnStatusCode: false
                    }).then((respostaSaldo) => {
                        expect(respostaSaldo.status).to.equal(200)
                        expect(respostaSaldo.statusText).to.equal('OK')
                        expect(respostaSaldo.body[0].saldo).to.equal(valores)
                    })
                })
            })
        })

        it('Deve revalidar o saldo após o cadastro de mais de uma movimentação do tipo de Receita já pago', () => {
            cy.request({
                url: '/contas',
                method: 'GET',
                headers: {
                    authorization: `JWT ${token}`
                },
                qs: {
                    nome: 'Conta para saldo'
                },
            }).then((respostaConta) => {
                expect(respostaConta.status).to.equal(200)
                expect(respostaConta.statusText).to.equal('OK')
                let contaId = respostaConta.body[0].id
                let valorReceita = 534
                cy.request({
                    url: '/transacoes',
                    method: 'POST',
                    headers: {
                        authorization: `JWT ${token}`
                    },
                    body: {
                        conta_id: `${contaId}`,
                        data_pagamento: "04/02/2023",
                        data_transacao: "04/02/2023",
                        descricao: "Venda do Celular",
                        envolvido: "Celular",
                        status: true,
                        tipo: "REC",
                        valor: `${valorReceita}`
                    },
                    failOnStatusCode: false
                }).then((respostaMovimentacao) => {
                    expect(respostaMovimentacao.status).to.equal(201)
                    expect(respostaMovimentacao.statusText).to.equal('Created')
                    expect(respostaMovimentacao.body.id).to.exist
                    cy.request({
                        url: '/extrato/202302',
                        method: 'GET',
                        headers: { authorization: `JWT ${token}` },
                        qs: {
                            conta_id: `${contaId}`,
                            orderBy: 'data_pagamento'
                        },
                        failOnStatusCode: false
                    }).then((respostaMovimentacao) => {
                        expect(respostaMovimentacao.status).to.equal(200)
                        expect(respostaMovimentacao.statusText).to.equal('OK')
                        let valorRespostaMovimentacao = parseInt(respostaMovimentacao.body[6].valor)
                        let valores = valorReceita + valorRespostaMovimentacao
                        cy.request({
                            url: '/saldo',
                            method: 'GET',
                            headers: { authorization: `JWT ${token}` },
                            failOnStatusCode: false
                        }).then((respostaSaldo) => {
                            expect(respostaSaldo.status).to.equal(200)
                            expect(respostaSaldo.statusText).to.equal('OK')
                            let valorConvertido = parseInt(respostaSaldo.body[2].saldo)
                            expect(valorConvertido).to.equal(valores)
                        })
                    })
                })
            })
        })
    })
})