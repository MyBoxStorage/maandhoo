import React from 'react'

// ── LGPD: data de atualização fixada manualmente ──────────────────────────────
// NÃO use new Date() aqui — a data deve refletir a última alteração real da política,
// não a data de renderização. Atualize este valor sempre que a política for modificada.
const ULTIMA_ATUALIZACAO = '01/06/2025'

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

            {/* ── IDENTIFICAÇÃO DO CONTROLADOR (art. 9º LGPD) ────────────── */}
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Controlador dos Dados</h4>
            <p>
              <strong className="text-bege">Razão Social:</strong> [RAZÃO SOCIAL DO ESTABELECIMENTO]<br />
              <strong className="text-bege">CNPJ:</strong> [00.000.000/0001-00]<br />
              <strong className="text-bege">Endereço:</strong> [Endereço completo, Balneário Camboriú — SC]<br />
              <strong className="text-bege">E-mail do Encarregado (DPO):</strong>{' '}
              <a href="mailto:privacidade@maandhoo.com" className="text-dourado underline underline-offset-2">
                privacidade@maandhoo.com
              </a>
            </p>

            {/* ── ENCARREGADO DE DADOS / DPO (art. 41 LGPD) ─────────────── */}
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Encarregado de Proteção de Dados (DPO)</h4>
            <p>
              O Maandhoo Club designou como Encarregado de Proteção de Dados:{' '}
              <strong className="text-bege">[Nome do Encarregado]</strong>, responsável por atender
              solicitações de titulares e comunicar-se com a Autoridade Nacional de Proteção de Dados (ANPD).
              Contato: <a href="mailto:privacidade@maandhoo.com" className="text-dourado underline underline-offset-2">privacidade@maandhoo.com</a>.
            </p>

            <p>O Maandhoo Club respeita sua privacidade e está comprometido com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>

            {/* ── DADOS COLETADOS ─────────────────────────────────────────── */}
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Dados Coletados e Finalidades</h4>
            <p>Coletamos os seguintes dados pessoais e os utilizamos para as finalidades indicadas:</p>
            <ul className="list-disc pl-5 space-y-1 text-bege-escuro/70">
              <li><strong className="text-bege">Nome completo</strong> — identificação nominal do ingresso e controle de acesso</li>
              <li><strong className="text-bege">CPF</strong> — vinculação do ingresso ao titular e verificação de identidade na portaria</li>
              <li><strong className="text-bege">E-mail</strong> — envio de ingresso, confirmações e comunicações sobre o evento</li>
              <li><strong className="text-bege">WhatsApp</strong> — notificações urgentes sobre o evento e suporte ao cliente</li>
              <li><strong className="text-bege">Gênero</strong> — aplicação da política de precificação diferenciada do estabelecimento, conforme prática do setor</li>
            </ul>

            {/* ── USO DOS DADOS ────────────────────────────────────────────── */}
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Base Legal do Tratamento</h4>
            <p>
              O tratamento dos dados é fundamentado nas seguintes bases legais previstas no art. 7º da LGPD:{' '}
              <strong className="text-bege">execução de contrato</strong> (emissão e gestão de ingressos) e{' '}
              <strong className="text-bege">consentimento</strong> do titular para comunicações opcionais.
              Não vendemos, compartilhamos ou cedemos seus dados a terceiros para fins comerciais.
            </p>

            {/* ── RETENÇÃO DE DADOS (art. 9º LGPD) ───────────────────────── */}
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Retenção e Descarte de Dados</h4>
            <p>
              Os dados pessoais são retidos pelo período necessário ao cumprimento da finalidade para a qual foram coletados,
              observados os seguintes prazos:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-bege-escuro/70">
              <li>Dados de ingresso e acesso a eventos: <strong className="text-bege">até 5 (cinco) anos</strong> após a realização do evento, para fins de cumprimento de obrigações legais e fiscais</li>
              <li>Dados de comunicação (e-mail, WhatsApp): até a <strong className="text-bege">revogação do consentimento</strong> pelo titular ou solicitação de exclusão</li>
              <li>Registros de consentimento (LGPD): <strong className="text-bege">5 (cinco) anos</strong>, para fins de comprovação regulatória</li>
            </ul>
            <p>
              Após o prazo de retenção, os dados são eliminados de forma segura ou anonimizados, de modo que não possam
              ser associados ao titular.
            </p>

            {/* ── DIREITOS DOS TITULARES ───────────────────────────────────── */}
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Seus Direitos (art. 18 LGPD)</h4>
            <p>Você tem direito a solicitar, a qualquer momento:</p>
            <ul className="list-disc pl-5 space-y-1 text-bege-escuro/70">
              <li>Confirmação da existência de tratamento dos seus dados</li>
              <li>Acesso aos dados que temos sobre você</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos seus dados a outro fornecedor de serviço</li>
              <li>Eliminação dos dados tratados com base no seu consentimento</li>
              <li>Revogação do consentimento a qualquer momento, sem prejuízo à legalidade do tratamento anterior</li>
              <li>Informação sobre o não fornecimento de consentimento e suas consequências</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato com nosso Encarregado pelo e-mail{' '}
              <a href="mailto:privacidade@maandhoo.com" className="text-dourado underline underline-offset-2">
                privacidade@maandhoo.com
              </a>
              . O prazo de resposta é de até 15 (quinze) dias corridos.
            </p>

            {/* ── SEGURANÇA ────────────────────────────────────────────────── */}
            <h4 className="font-accent text-xs tracking-widest uppercase text-dourado mt-6 mb-2">Segurança dos Dados</h4>
            <p>
              Adotamos medidas técnicas e administrativas adequadas para proteger seus dados contra acesso não
              autorizado, destruição, perda, alteração ou divulgação indevida, incluindo controle de acesso,
              criptografia e registro de operações.
            </p>

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

        {/* ── RODAPÉ COM DATA FIXA ──────────────────────────────────────────── */}
        <p className="text-xs text-bege-escuro/30 text-center">
          Última atualização: {ULTIMA_ATUALIZACAO} · Maandhoo Club — contato@maandhoo.com
        </p>
      </div>
    </div>
  )
}
