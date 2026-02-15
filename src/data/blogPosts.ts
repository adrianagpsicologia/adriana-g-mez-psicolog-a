import blogCelos from "@/assets/blog-celos.jpg";
import blogPensamientos from "@/assets/blog-pensamientos.jpg";
import blogTiempo from "@/assets/blog-tiempo.jpg";
import blogPositividad from "@/assets/blog-positividad.jpg";
import blogActos from "@/assets/blog-actos.jpg";
import blogAcuerdos from "@/assets/blog-acuerdos.jpg";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "celos",
    title: "Celos",
    excerpt: "Los celos principalmente los genera la inseguridad, el sentirnos menos que la otra persona. Mirar hacia dentro es clave para entenderlos.",
    category: "Pareja",
    image: blogCelos,
    content: [
      "Hace un tiempo hablábamos en Instagram de los celos, qué pensabais qué los provocaba y qué terminaban generando. En este post pongo en común las respuestas más repetidas:",
      "Los celos principalmente los genera la inseguridad, el sentirnos menos que la otra persona, nos da la sensación que va a encontrar algo mejor, que tenemos que estar constantemente alerta, interpretando las señales para ver si es posible que se acerque ese momento en el que pueda encontrar a esa otra persona que nos «supera».",
      "Otro de los factores que es muy, muy habitual que genere celos, es el dejar de sentirnos la novedad, y esto tiene muchísimo sentido, al final parece que necesitamos sentir estímulos muy muy fuertes, y si nos normalizan, dejamos de transmitir ese sentimiento tan fuerte.",
      "A vuestros comentarios añadí la falta de información, y, me explico, este es un factor que genera celos junto a la ayuda de la inseguridad: cuando nos falta información, la rellenamos con lo que más fácil nos resulte «inventar», si tenemos esa tendencia a la inseguridad, a hacernos de menos o dudar de nuestra valía, las ideas que generemos, lo más probable es que terminen siendo negativas.",
      "El segundo punto que comentamos es qué termina generando los celos, un aspecto bastante habitual es terminar culpando a la otra persona de nuestros celos, cuando la mayoría de las veces, no son los actos de nuestra pareja los que hacen que sintamos estos celos, sino como hemos dicho anteriormente, aspectos internos.",
      "Si bien la inseguridad suele ser causa, termina siendo también consecuencia, pues parece que reafirmamos esas ideas inseguras, y termina haciendo que la inseguridad, y el miedo, vayan a más. Muchas veces, tras estos celos, creemos que el problema es que no somos lo suficientemente válidxs, y ahí podemos terminar cayendo en querer cambiarnos, llegando a ser de una manera que no es fiel a nosotrxs mismxs, buscando satisfacer más a nuestra pareja para que no sienta la necesidad de «buscar nada fuera».",
      "Y, por supuesto, todo miedo por algo que pudiera pasar en un futuro y que modifica nuestros actos presentes, nos genera ansiedad.",
      "Y, ahora te puedes estar preguntando, ¿cómo trato estos celos? Yo sé que soy súper pesada con esto, de verdad que lo sé, pero es tremendamente importante mirar hacia dentro, saber identificar qué es inseguridad nuestra y qué son cosas externas que puedan estar afectándonos. Sin conocimiento de causa, no podemos modificar nada, y, muchas veces, en cuanto entendemos la causa, esta empieza a verse tan absurda, que deja de aparecer.",
    ],
  },
  {
    slug: "tus-pensamientos-no-son-hechos",
    title: "Tus pensamientos no son hechos",
    excerpt: "Los pensamientos son una interpretación de los hechos, no el hecho como tal. Ante un mismo hecho, podemos tener diferentes pensamientos.",
    category: "Autoconocimiento",
    image: blogPensamientos,
    content: [
      "Los pensamientos son una interpretación de los hechos, no el hecho como tal.",
      "Me explico:",
      "Un hecho, es, por ejemplo, oír ruidos en tu casa por la noche.",
      "Un posible pensamiento ante esto es: «han entrado a robar», este pensamiento posiblemente nos generará bastante miedo.",
      "Otro posible pensamiento es: «seguro que me he dejado una ventana abierta y se ha caído algo», este pensamiento sería bastante raro que nos generase miedo.",
      "Ante un mismo hecho, podemos tener diferentes pensamientos, y estos últimos nos generarán diferentes emociones.",
      "En líneas generales, el malestar proviene más del pensamiento que del hecho en sí. Ante los acontecimientos que han tenido lugar, poco podemos hacer, sin embargo, la interpretación que les damos, el pensamiento que les atribuimos, sí podemos cambiarlo.",
      "Recuerda: Tus pensamientos no son hechos.",
    ],
  },
  {
    slug: "el-tiempo-todo-lo-cura",
    title: "El tiempo todo lo cura, ¿seguro?",
    excerpt: "El tiempo no cura, el tiempo no nos hace entender. La introspección y el trabajo a nivel anímico, en cambio, sí lo hacen.",
    category: "Bienestar",
    image: blogTiempo,
    content: [
      "¿Cuántas veces has oído la ya típica frase \"El tiempo todo lo cura\"?",
      "Yo demasiadas, es por esto que, te cuento: El tiempo no cura, el tiempo no nos hace entender, no nos hace mejorar. La introspección o el trabajo a nivel anímico en cambio, sí lo hacen.",
      "El tiempo no cura un corazón roto. Lo curan la reflexión que viene después, el ver qué otras cosas nos generan bienestar y enfocarnos en ellas, el crear nuevos proyectos vitales, y un largo etcétera (lo cual es genial, significa que no hay una única cosa que pueda resolverlo, sino muchísimas más).",
      "Es cierto que hay situaciones en las que, para mejorar, es necesario tiempo, pero no porque el tiempo vaya a arreglar algo, sino porque arreglarlo, es un trabajo largo, que conlleva tiempo.",
      "Entender esta diferencia es crucial, pues quedarnos en una situación dolorosa entendiendo que la solución es el movimiento de las manecillas del reloj o el pasar hojas en el calendario puede alargar enormemente el sufrimiento.",
    ],
  },
  {
    slug: "positividad-puede-ser-danina",
    title: "Positividad, ¿puede llegar a ser dañina?",
    excerpt: "La positividad es buena hasta que empieza a generarnos un conflicto interno. Permitirnos estar mal es completamente válido.",
    category: "Emociones",
    image: blogPositividad,
    content: [
      "Positividad, en principio todo debería estar bien, algo positivo es algo bueno, ¿pero es siempre así?",
      "La positividad es buena hasta que empieza a generarnos un conflicto interno, como podría ser:",
      "Subestimar el problema: La positividad muchas veces pretende «quitarle hierro al asunto». No es cuestión de quitarle hierro al asunto, es cuestión de entender la situación. Y llevar a cabo estrategias que nos permitan hacerle frente: pero nunca no dándole la importancia que tiene. Nadie ganará una batalla subestimando al rival.",
      "Sensación de obligación de mantener una actitud positiva constante: Hay situaciones en las cuales no es racional ser positivo, es antinatural, y por lo tanto, demoledora. Nos supone un gasto de energía tremendo, por lo que, no sólo tenemos el problema en cuestión, sino que además, nos sentimos obligados a mostrar que lo enfocamos de una manera positiva. Es decir, que nos veríamos ante dos problemas.",
      "Malestar por no ser capaces de mantener este nivel de positividad: En relación al punto anterior, esta positividad antinatural supone un gasto de energía que no es sostenible en el tiempo, por lo tanto, el habernos propuesto estos niveles de positividad y haber fracasado, nos puede generar una enorme sensación de malestar.",
      "Y no es cuestión de dejar de ser positivo. Sino de saber identificar las situaciones a las que nos enfrentamos de una manera racional que no nos genere un malestar adicional. De no exigirnos mantener una postura positiva cuando quizás no tengamos energía para ello. De permitirnos estar mal, porque hay veces en las que simplemente necesitamos estar mal, y esto es completamente válido.",
    ],
  },
  {
    slug: "nuestros-actos-y-como-nos-vemos",
    title: "Nuestros actos y cómo nos vemos",
    excerpt: "Si nuestra conducta está enfocada en complacer a los demás, nuestra cabeza concluirá que nuestras opiniones no son válidas.",
    category: "Autoestima",
    image: blogActos,
    content: [
      "La cabeza hace una conexión muy rápida entre nuestros actos y cómo nos vemos.",
      "Y me explico: si nuestra conducta, por ejemplo, está enfocada en complacer a los demás, en intentar agradar, la lectura que sacará nuestra cabeza será que el éxito que tenemos en nuestras relaciones (ya sea a nivel social, laboral, romántico, familiar…), es debido a esta tendencia a complacer.",
      "Y, por lo tanto, llegará a la conclusión de que complacer, obligarnos a actuar como a otras personas les va a gustar (sin importar qué es lo que queremos nosotros), es algo completamente necesario en nuestras relaciones, y que nuestras opiniones o deseos, no son válidos.",
      "Lo cual terminaría conllevando una muy baja estima de nuestra persona.",
    ],
  },
  {
    slug: "acuerdos-en-pareja",
    title: "Acuerdos en pareja",
    excerpt: "No basta con establecer el respeto como obligación, sino acordar los pequeños actos que consideramos que lo implican.",
    category: "Pareja",
    image: blogAcuerdos,
    content: [
      "Una relación (realmente de cualquier tipo, no sólo de pareja), es, si nos pusiéramos a analizarla muy fríamente, como un contrato, en el cual deberíamos acordar qué cosas son válidas y cuales no.",
      "Hasta aquí todo bien y parece súper sencillo, ¿verdad? Pues espera que sigo, porque seguro que te habrás visto envueltx en algunas de estas dificultades.",
      "Una de esas cosas obligatorias que estableceremos en la relación de pareja puede ser el respeto hacia el otro, ¿no? Y me diréis \"exacto Adriana, no me cuentas nada nuevo\". Pero, ¿os ha pasado alguna vez que hagáis algo, y os digan que eso es faltarle al respeto, y vosotrxs no verlo así? O al contrario.",
      "Es que no son sólo estos términos los que tenemos que acordar en pareja sino -qué implican- los propios términos. Volviendo al caso del respeto, ¿qué es respetar a tu pareja? ¿Respetar a tu pareja es no hablar con tu ex? ¿Tirar sus regalos? ¿Quitar de las redes sociales a aquellas personas con las que anteriormente hayamos tonteado?",
      "Hay muchísimos criterios que pueden considerarse o no respeto, de ahí la importancia a no únicamente establecer el respeto como una obligación en la pareja, sino los pequeños actos que consideramos que lo implican. Ver qué criterios considera uno y otro y decidir con cuales os quedáis como obligatorios y cuales no.",
      "Recordad que cada pareja es diferente, y hay parejas que podrán ver súper bien el contacto con los exs, y parejas que no, etc etc.",
      "La idea es que siempre, lo que hagáis, sea consensuado por ambas partes, y estar dispuesto a ir modificando esas \"normas\" que se establecen en la pareja.",
    ],
  },
];
