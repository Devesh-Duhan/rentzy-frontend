"use client";
import { Building, MapPin, IndianRupee, ChevronDown, BedDouble, Home, RotateCcw } from "lucide-react";
import styles from "./Filters.module.css";

export default function PropertyQuickFilters({ filters, onChange, onClear, hasActiveFilters, idPrefix, types, cities, priceRanges, bhkOptions, bedroomOptions }) {
  const optionClass = selected => `${styles.option} ${selected ? styles.optionActive : ""}`;
  return <div className={styles.filterContent}>
    <fieldset className={styles.filterGroup}>
      <legend className={styles.filterLabel}><span className={`${styles.groupIcon} ${styles.typeIcon}`}><Building size={15} /></span>Property Type</legend>
      <div className={styles.typeOptions}>{types.map(type => <button type="button" key={type} aria-pressed={filters.type === type} onClick={() => onChange("type", type)} className={optionClass(filters.type === type)}>{type}</button>)}</div>
    </fieldset>
    <div className={styles.filterGroup}>
      <label htmlFor={`${idPrefix}-city`} className={styles.filterLabel}><span className={`${styles.groupIcon} ${styles.cityIcon}`}><MapPin size={15} /></span>City</label>
      <div className={styles.selectWrap}><select id={`${idPrefix}-city`} value={filters.city} onChange={event => onChange("city", event.target.value)} className={styles.select}>{cities.map(city => <option key={city} value={city}>{city}</option>)}</select><ChevronDown size={15} /></div>
    </div>
    <div className={styles.filterGroup}>
      <label htmlFor={`${idPrefix}-price`} className={styles.filterLabel}><span className={`${styles.groupIcon} ${styles.priceIcon}`}><IndianRupee size={15} /></span>Price Range</label>
      <div className={styles.selectWrap}><select id={`${idPrefix}-price`} value={filters.priceRange} onChange={event => onChange("priceRange", event.target.value)} className={styles.select}>{priceRanges.map(range => <option key={range.label} value={range.label}>{range.label}</option>)}</select><ChevronDown size={15} /></div>
    </div>
    {[{ key: "bhk", label: "BHK", Icon: BedDouble, tone: styles.bhkIcon, options: bhkOptions }, { key: "bedrooms", label: "Bedrooms", Icon: Home, tone: styles.bedroomIcon, options: bedroomOptions }].map(({ key, label, Icon, tone, options }) => <fieldset key={key} className={styles.filterGroup}>
      <legend className={styles.filterLabel}><span className={`${styles.groupIcon} ${tone}`}><Icon size={15} /></span>{label}</legend>
      <div className={styles.numberOptions}>{options.map(value => <button type="button" key={value} aria-pressed={filters[key] === value} onClick={() => onChange(key, value)} className={optionClass(filters[key] === value)}>{value}</button>)}</div>
    </fieldset>)}
    {hasActiveFilters && <button type="button" onClick={onClear} className={styles.clearFilters}><RotateCcw size={14} />Clear All Filters</button>}
  </div>;
}

