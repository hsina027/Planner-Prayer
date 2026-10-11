import React, {Children, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Check, ChevronDown} from 'lucide-react';
type Props = React.SelectHTMLAttributes<HTMLSelectElement>;
const optionText = (node:React.ReactNode):string => Children.toArray(node).map(child => isValidElement(child) ? optionText((child.props as {children?:React.ReactNode}).children) : String(child)).join('');
export default function Select({children, value, onChange, disabled, 'aria-label': ariaLabel, ...props}: Props) {
  const options = Children.toArray(children).filter(isValidElement).map(child => {
    const p = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
    return {value:String(p.value ?? optionText(p.children)), label:optionText(p.children), disabled:!!p.disabled};
  });
  const selected = Math.max(0, options.findIndex(o=>o.value===String(value)));
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(selected);
  const [label,setLabel]=useState(ariaLabel || '');
  const [position,setPosition]=useState({left:0,top:0,width:0,height:260});
  const trigger=useRef<HTMLButtonElement>(null);
  const menu=useRef<HTMLDivElement>(null);
  const id=useId();
  const [theme,setTheme]=useState({dark:false,sidebar:false,dir:'ltr'});
  const typed=useRef({text:'',time:0});
  useEffect(()=>{
    const parent=trigger.current?.closest('label');
    const text=parent ? Array.from(parent.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim() : '';
    setLabel(ariaLabel || text);
  },[ariaLabel,children]);
  const close=()=>setOpen(false);
  const choose=(index:number)=>{
    const option=options[index];if(!option || option.disabled)return;
    onChange?.({target:{value:option.value},currentTarget:{value:option.value}} as React.ChangeEvent<HTMLSelectElement>);
    close(); trigger.current?.focus();
  };
  useLayoutEffect(()=>{
    if(!open)return;
    const place=()=>{
      const el=trigger.current;if(!el)return;
      const box=el.getBoundingClientRect();
      const width=Math.min(box.width,window.innerWidth-16);
      const below=Math.max(0,window.innerHeight-box.bottom-14);
      const above=Math.max(0,box.top-14);
      const desired=Math.min(260,options.length*38+12);
      const up=below<desired && above>below;
      const height=Math.min(desired,up?above:below);
      setPosition({left:Math.max(8,Math.min(box.left,window.innerWidth-width-8)),top:up?box.top-height-6:box.bottom+6,width,height});
      setTheme({dark:!!el.closest('.dark'),sidebar:!!el.closest('.sidebar'),dir:document.documentElement.dir || 'ltr'});
    };
    place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    const outside=(e:PointerEvent)=>{if(!trigger.current?.contains(e.target as Node) && !menu.current?.contains(e.target as Node))close()};
    document.addEventListener('pointerdown',outside);
    return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);document.removeEventListener('pointerdown',outside)};
  },[open,options.length]);
  useEffect(()=>{if(open)menu.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({block:'nearest'})},[open,active]);
  const keydown=(e:React.KeyboardEvent)=>{
    if(e.key==='Escape'){e.preventDefault();close();return}
    if(e.key==='Tab'){close();return}
    if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
      e.preventDefault();setOpen(true);
      const direction=e.key==='ArrowUp'?-1:1;
      const start=!open?selected:active;
      let index=e.key==='Home'?0:e.key==='End'?options.length-1:Math.max(0,Math.min(options.length-1,start+direction));
      while(options[index]?.disabled && index>=0 && index<options.length)index+=direction;
      if(options[index])setActive(index);return;
    }
    if(e.key==='Enter' || e.key===' '){e.preventDefault();if(open)choose(active);else{setActive(selected);setOpen(true)}return}
    if(e.key.length===1 && !e.ctrlKey && !e.metaKey){
      e.preventDefault();const now=Date.now();typed.current={text:(now-typed.current.time<700?typed.current.text:'')+e.key,time:now};
      const index=options.findIndex(o=>!o.disabled && o.label.toLocaleLowerCase().startsWith(typed.current.text.toLocaleLowerCase()));
      if(index>=0){setActive(index);setOpen(true)}
    }
  };
  return <span className="app-select">
    <button ref={trigger} id={props.id} type="button" className="app-select-trigger" role="combobox" aria-label={label || undefined} aria-expanded={open} aria-haspopup="listbox" aria-controls={id} aria-activedescendant={open?`${id}-${active}`:undefined} disabled={disabled} onKeyDown={keydown} onClick={()=>{setActive(selected);setOpen(!open)}}>
      <span className="select-value">{options[selected]?.label}</span><ChevronDown className={open?'select-chevron expanded':'select-chevron'} size={16} aria-hidden="true"/>
    </button>
    {open && createPortal(<div ref={menu} id={id} role="listbox" aria-label={label || undefined} dir={theme.dir} className={`app-select-menu ${theme.dark?'select-dark':''} ${theme.sidebar?'select-sidebar':''}`} style={{position:'fixed',left:position.left,top:position.top,width:position.width,maxHeight:position.height}} onClick={e=>e.stopPropagation()}>
      {options.map((o,i)=><div key={o.value} id={`${id}-${i}`} role="option" aria-selected={i===selected} aria-disabled={o.disabled || undefined} data-index={i} className={`app-select-option ${i===active?'focused':''} ${i===selected?'chosen':''}`} onPointerMove={()=>!o.disabled&&setActive(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(i)}><span>{o.label}</span>{i===selected&&<Check size={15} aria-hidden="true"/>}</div>)}
    </div>,document.body)}
  </span>;
}
