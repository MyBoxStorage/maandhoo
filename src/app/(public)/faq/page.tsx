'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    categoria: 'Ingressos',
    itens: [
      {
        q: 'Como funciona o ingresso online?',
        a: 'Você compra pelo site, preenche seus dados pessoais com CPF e email, realiza o pagamento via PIX ou cartão. O ingresso em PDF com QR Code é gerado automaticamente e enviado ao seu email em instantes.',
      },
      {
        q: 'O ingresso é nominal? Preciso do CPF?',
        a: 'Sim. Todos os ingressos são nominais e vinculados ao CPF do comprador. Na entrada, o porteiro valida pelo QR Code ou confere o CPF. Não é transferível.',
      },
      {
        q: 'Posso presentear alguém com o ingresso?',
        a: 'Por ser nominal, o ingresso deve ser comprado com os dados da pessoa que vai usar. Preencha o nome e CPF de quem vai comparecer ao evento.',
      },
      {
        q: 'O que é o lote? Como funciona?',
        a: 'Os ingressos são vendidos em lotes com preços crescentes. Quanto antes você compra, mais barato paga. Quando um lote esgota, o próximo é ativado automaticamente. Os preços atuais estão sempre visíveis na página do evento.',
      },
      {
        q: 'Qual a diferença entre Pista e Backstage?',
        a: 'Pista dá acesso à área principal da casa. Backstage é um upgrade premium com acesso a área exclusiva, mais próxima do palco e do DJ, com melhor visualização.',
      },
    ],
  },
  {
    categoria: 'Lista Amiga',
    itens: [
      {
        q: 'Como funciona a Lista Amiga?',
        a: 'Você coloca seu nome e email na lista do evento. Chegando até 00:00, feminino entra gratuitamente e masculino paga R$ 50 fixo. Você receberá um QR Code por email para facilitar a entrada na portaria.',
      },
      {
        q: 'A lista tem limite de vagas?',
        a: 'Sim. O número de vagas disponíveis é definido pela equipe para cada evento e pode variar. Fique atento às informações na página do evento. Quando as vagas esgotam, a lista fecha.',
      },
      {
        q: 'A lista é válida até que horas?',
        a: 'A lista é válida até 00:00 (meia-noite). Após esse horário, o benefício não se aplica e o ingresso passa a ser cobrado pelo preço normal.',
      },
    ],
  },
  {
    categoria: 'Reservas',
    itens: [
      {
        q: 'Como faço para reservar uma mesa ou camarote?',
        a: 'Preencha o formulário de reserva no site ou entre em contato diretamente pelo WhatsApp (47) 9930-0283. Nossa equipe confirmará a disponibilidade e os detalhes via WhatsApp em até 24h.',
      },
      {
        q: 'Existe consumação mínima para mesa ou camarote?',
        a: 'Sim. O valor mínimo de consumação varia de acordo com a área e o evento. Consulte nossa equipe pelo WhatsApp para informações atualizadas.',
      },
      {
        q: 'Quantas pessoas cabem em uma mesa e em um camarote?',
        a: 'As mesas comportam até 5 pessoas. Os camarotes comportam até 10 pessoas.',
      },
      {
        q: 'Como funciona o pacote de aniversário?',
        a: 'O aniversariante tem entrada gratuita na pista durante toda a noite mediante confirmação prévia pelo WhatsApp. A reserva deve ser feita com no mínimo 1 dia de antecedência.',
      },
    ],
  },
  {
    categoria: 'Cancelamento e Reembolso',
    itens: [
      {
        q: 'Posso cancelar meu ingresso e receber reembolso?',
        a: 'Sim. Você tem direito a reembolso total se solicitar com 7 ou mais dias de antecedência ao evento. Após esse prazo, o reembolso é de 50% do valor pago. Entre em contato pelo email contato@maandhoo.com.',
      },
      {
        q: 'O evento foi cancelado. Serei reembolsado?',
        a: 'Sim. Em caso de cancelamento do evento pela organização, todos os compradores são reembolsados integralmente.',
      },
      {
        q: 'A atração foi alterada. Tenho direito a reembolso?',
        a: 'Alterações de line-up (substituição de atrações) não geram direito automático a reembolso. Em caso de cancelamento total do evento, sim. Comunicamos as alterações com antecedência pelos nossos canais.',
      },
    ],
  },
  {
    categoria: 'Funcionamento e Acesso',
    itens: [
      {
        q: 'Qual é o endereço do Maandhoo Club?',
        a: 'Rua Brás Cubas, 35 — Bairro Nova Esperança, Balneário Camboriú - SC.',
      },
      {
        q: 'Qual é a idade mínima para entrar?',
        a: 'O acesso é restrito a maiores de 18 anos. É obrigatória a apresentação de documento com foto na entrada.',
      },
      {
        q: 'Tem estacionamento?',
        a: 'Sim, o Maandhoo Club dispõe de estacionamento próprio.',
      },
      {
        q: 'Quais dias costumam ter festa?',
        a: 'Os eventos acontecem geralmente às sextas, sábados e domingos, variando conforme o calendário. Acompanhe nossa agenda no site e no Instagram @maandhoo_club.',
      },
    ],
  },
]

export default function FAQPage() {
  const [abertos, setAbertos] = useState<string[]>([])

  const toggle = (id: string) => {
    setAbertos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-subtitle mb-3">Dúvidas</p>
          <h1 className="section-title mb-4">Perguntas Frequentes</h1>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        <div className="space-y-10">
          {faqs.map(cat => (
            <div key={cat.categoria}>
              <h3 className="font-accent text-xs tracking-[0.3em] uppercase text-dourado mb-4 pl-1">{cat.categoria}</h3>
              <div className="space-y-2">
                {cat.itens.map((item, i) => {
                  const id = `${cat.categoria}-${i}`
                  const aberto = abertos.includes(id)
                  return (
                    <div key={id} className={`border rounded-sm transition-all duration-300
                      ${aberto ? 'border-dourado/40 bg-dourado/5' : 'border-white/8 bg-card hover:border-white/15'}`}>
                      <button
                        onClick={() => toggle(id)}
                        className="w-full flex items-center justify-between p-5 text-left gap-4"
                      >
                        <span className="font-body text-sm text-bege">{item.q}</span>
                        {aberto ? <ChevronUp size={16} className="text-dourado flex-shrink-0" /> : <ChevronDown size={16} className="text-bege-escuro/50 flex-shrink-0" />}
                      </button>
                      {aberto && (
                        <div className="px-5 pb-5">
                          <p className="font-body text-sm text-bege-escuro/80 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center bg-card border border-gold/20 rounded-sm p-8">
          <h3 className="font-display text-2xl text-bege mb-2">Ainda tem dúvidas?</h3>
          <p className="font-body text-sm text-bege-escuro/70 mb-5">Fale com a nossa equipe</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://wa.me/5547999300283" target="_blank" rel="noopener noreferrer" className="btn-primary text-xs">
              WhatsApp (47) 9930-0283
            </a>
            <a href="mailto:contato@maandhoo.com" className="btn-outline text-xs">
              contato@maandhoo.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
