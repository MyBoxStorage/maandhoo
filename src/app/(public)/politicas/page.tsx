import React from 'react'

export default function PoliticasPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto prose-maandhoo">
        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">Legal</p>
          <h1 className="section-title mb-4">Políticas e Termos</h1>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* PRIVACIDADE */}
        <section id="privacidade" className="mb-12">
          <h2 className="font-display text-3xl text-bege mb-6">Política de Privacidade (LGPD)</h2>
          <div className="space-y-4 font-body text-sm text-bege-escuro/80 leading-relaxed">
            <p>O Maandhoo Club respeita sua privacidade e está comprometido com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Dados Coletados</h4>
            <p>Coletamos os seguintes dados pessoais: nome completo, CPF, endereço de e-mail e número de WhatsApp. Esses dados são coletados exclusivamente para a emissão de ingressos nominais, gestão de reservas, envio de confirmações e comunicações relacionadas aos eventos do Maandhoo Club.</p>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Uso dos Dados</h4>
            <p>Seus dados são utilizados para: emissão e envio de ingressos; confirmação e gestão de reservas; notificações sobre eventos e alterações de programação; cumprimento de obrigações legais. Não vendemos, compartilhamos ou cedemos seus dados a terceiros para fins comerciais.</p>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Seus Direitos</h4>
            <p>Você tem direito a solicitar: acesso aos seus dados, correção de dados incorretos, exclusão dos seus dados, revogação do consentimento. Para exercer seus direitos, entre em contato pelo email contato@maandhoo.com.</p>
          </div>
        </section>

        <div className="divider-gold mb-12" />

        {/* TERMOS */}
        <section id="termos" className="mb-12">
          <h2 className="font-display text-3xl text-bege mb-6">Termos de Uso</h2>
          <div className="space-y-4 font-body text-sm text-bege-escuro/80 leading-relaxed">
            <p>Ao utilizar o site e os serviços do Maandhoo Club, você concorda com os presentes Termos de Uso.</p>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Ingressos</h4>
            <p>Os ingressos são pessoais, intransferíveis e nominais ao CPF informado na compra. A tentativa de uso de ingresso por terceiros resultará na negação de acesso sem direito a reembolso. O Maandhoo Club reserva-se o direito de alterar a programação artística sem obrigação de reembolso nos casos previstos na política de cancelamento.</p>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Acesso</h4>
            <p>O acesso ao Maandhoo Club é restrito a maiores de 18 anos, mediante apresentação de documento oficial com foto. A administração reserva-se o direito de recusar o acesso a qualquer pessoa sem necessidade de justificativa.</p>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Responsabilidade</h4>
            <p>O Maandhoo Club não se responsabiliza por pertences pessoais deixados nas dependências do estabelecimento. A casa conta com estacionamento próprio; porém, não se responsabiliza por danos ou furtos em veículos.</p>
          </div>
        </section>

        <div className="divider-gold mb-12" />

        {/* CANCELAMENTO */}
        <section id="cancelamento" className="mb-12">
          <h2 className="font-display text-3xl text-bege mb-6">Política de Cancelamento e Reembolso</h2>
          <div className="space-y-4 font-body text-sm text-bege-escuro/80 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="bg-card border border-green-500/20 rounded-sm p-5">
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-accent text-xs tracking-wider uppercase text-green-400 mb-2">Reembolso Total</h4>
                <p className="text-xs text-bege-escuro/70">Solicitação feita com <strong className="text-bege">7 ou mais dias</strong> de antecedência ao evento.</p>
              </div>
              <div className="bg-card border border-amber-500/20 rounded-sm p-5">
                <div className="text-2xl mb-2">⚠️</div>
                <h4 className="font-accent text-xs tracking-wider uppercase text-amber-400 mb-2">Reembolso Parcial (50%)</h4>
                <p className="text-xs text-bege-escuro/70">Solicitação feita com <strong className="text-bege">menos de 7 dias</strong> de antecedência ao evento.</p>
              </div>
            </div>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Como Solicitar</h4>
            <p>Para solicitar cancelamento e reembolso, envie um email para contato@maandhoo.com com: nome completo, número do pedido ou serial do ingresso, CPF e motivo da solicitação. O prazo de processamento do reembolso é de até 10 dias úteis.</p>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Cancelamento por Força Maior</h4>
            <p>Em caso de cancelamento do evento pela organização por motivo de força maior (condições climáticas extremas, determinação de autoridades, etc.), todos os compradores serão reembolsados integralmente.</p>
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Alteração de Programação</h4>
            <p>A substituição ou alteração de atrações artísticas não constitui motivo para reembolso, exceto em caso de cancelamento total do evento.</p>
          </div>
        </section>

        <p className="text-xs text-bege-escuro/30 text-center">
          Última atualização: {new Date().toLocaleDateString('pt-BR')} · Maandhoo Club — contato@maandhoo.com
        </p>
      </div>
    </div>
  )
}
