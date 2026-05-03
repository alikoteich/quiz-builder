import styles from './EntryList.module.css'

interface Props {
  items:    string[]
  onDelete: (i: number) => void
}

export default function EntryList({ items, onDelete }: Props) {
  if (!items.length) return null
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>✅ العناصر المضافة ({items.length})</div>
      <div className={styles.list}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.text}>{item}</span>
            <button className={styles.del} onClick={() => onDelete(i)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  )
}
