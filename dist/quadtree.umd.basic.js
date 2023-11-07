/* https://github.com/timohausmann/quadtree-ts.git v2.1.0 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Quadtree=e()}(this,(function(){"use strict";class t{constructor(t,e=0){this.bounds={x:t.x||0,y:t.y||0,width:t.width,height:t.height},this.maxObjects="number"==typeof t.maxObjects?t.maxObjects:10,this.maxLevels="number"==typeof t.maxLevels?t.maxLevels:4,this.level=e,this.objects=[],this.nodes=[]}getIndex(t){return t.qtIndex(this.bounds)}split(){const e=this.level+1,s=this.bounds.width/2,h=this.bounds.height/2,i=this.bounds.x,n=this.bounds.y,o=[{x:i+s,y:n},{x:i,y:n},{x:i,y:n+h},{x:i+s,y:n+h}];for(let i=0;i<4;i++)this.nodes[i]=new t({x:o[i].x,y:o[i].y,width:s,height:h,maxObjects:this.maxObjects,maxLevels:this.maxLevels},e)}insert(t){if(this.nodes.length){const e=this.getIndex(t);for(let s=0;s<e.length;s++)this.nodes[e[s]].insert(t)}else if(this.objects.push(t),this.objects.length>this.maxObjects&&this.level<this.maxLevels){this.nodes.length||this.split();for(let t=0;t<this.objects.length;t++){const e=this.getIndex(this.objects[t]);for(let s=0;s<e.length;s++)this.nodes[e[s]].insert(this.objects[t])}this.objects=[]}}retrieve(t){const e=this.getIndex(t);let s=this.objects;if(this.nodes.length)for(let h=0;h<e.length;h++)s=s.concat(this.nodes[e[h]].retrieve(t));return 0===this.level?Array.from(new Set(s)):s}remove(t,e=!1){const s=this.objects.indexOf(t);s>-1&&this.objects.splice(s,1);for(let e=0;e<this.nodes.length;e++)this.nodes[e].remove(t);return 0!==this.level||e||this.join(),-1!==s}join(){let t=Array.from(this.objects);for(let e=0;e<this.nodes.length;e++){const s=this.nodes[e].join();t=t.concat(s)}const e=Array.from(new Set(t));if(e.length<=this.maxObjects){this.objects=e;for(let t=0;t<this.nodes.length;t++)this.nodes[t].objects=[];this.nodes=[]}return t}clear(){this.objects=[];for(let t=0;t<this.nodes.length;t++)this.nodes.length&&this.nodes[t].clear();this.nodes=[]}}return Object.assign(t,{Rectangle:class{constructor(t){this.x=t.x,this.y=t.y,this.width=t.width,this.height=t.height,this.data=t.data}qtIndex(t){const e=[],s=t.x+t.width/2,h=t.y+t.height/2,i=this.y<h,n=this.x<s,o=this.x+this.width>s,l=this.y+this.height>h;return i&&o&&e.push(0),n&&i&&e.push(1),n&&l&&e.push(2),o&&l&&e.push(3),e}}})}));
