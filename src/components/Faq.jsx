import { useState } from 'react'
import { faqs } from '../data.js'
import { Icon, faPlus } from '../icons.js'

export default function Faq() {
  const [abierta, setAbierta] = useState(0)
  return (
    <section className="faq">
      <div className="section-head">
        <p className="eyebrow">Preguntas frecuentes</p>
        <h2 className="h2">Resolvemos tus <em>dudas</em>.</h2>
      </div>
      <div className="faq-list">
        {faqs.map((f, i) => (
          <div key={f.q} className={`faq-item ${abierta === i ? 'is-open' : ''}`}>
            <button onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}>
              <span>{f.q}</span><Icon icon={faPlus} className="faq-ico" aria-hidden="true" />
            </button>
            <div className="faq-a"><div><p>{f.a}</p></div></div>
          </div>
        ))}
      </div>
    </section>
  )
}
