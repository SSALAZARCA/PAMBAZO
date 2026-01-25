// Colección completa de recetas de panadería
// Incluye recetas internacionales y colombianas

export interface Recipe {
    id: string;
    name: string;
    category: string;
    difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
    prepTime: number; // minutos
    bakingTime: number; // minutos
    temperature: number; // °C
    yield: number; // porciones/unidades
    rating: number;
    ingredients: { name: string; quantity: string }[];
    steps: string[];
    tips: string[];
    image?: string;
}

export const BAKERY_RECIPES: Recipe[] = [
    // PANADERÍA FRANCESA
    {
        id: '1',
        name: 'Croissant Francés',
        category: 'Panadería Francesa',
        difficulty: 'Avanzado',
        prepTime: 180,
        bakingTime: 12,
        temperature: 200,
        yield: 24,
        rating: 4.9,
        ingredients: [
            { name: 'Harina de trigo panadera', quantity: '500g' },
            { name: 'Mantequilla francesa', quantity: '250g' },
            { name: 'Leche', quantity: '200ml' },
            { name: 'Azúcar', quantity: '50g' },
            { name: 'Sal', quantity: '10g' },
            { name: 'Levadura fresca', quantity: '20g' },
        ],
        steps: [
            'Mezclar harina, azúcar, sal y levadura',
            'Agregar leche tibia y amasar hasta obtener masa lisa',
            'Refrigerar 30 minutos',
            'Extender la masa y colocar mantequilla fría en el centro',
            'Realizar 3 dobleces dobles (laminado)',
            'Refrigerar entre cada doblez',
            'Cortar triángulos y enrollar',
            'Dejar leudar 2 horas',
            'Barnizar con huevo',
            'Hornear a 200°C por 12 minutos'
        ],
        tips: [
            'La mantequilla debe estar fría pero maleable',
            'Mantener todo frío durante el laminado',
            'No estirar demasiado la masa al enrollar'
        ]
    },
    {
        id: '2',
        name: 'Baguette Tradicional',
        category: 'Panadería Francesa',
        difficulty: 'Intermedio',
        prepTime: 240,
        bakingTime: 8,
        temperature: 240,
        yield: 4,
        rating: 4.8,
        ingredients: [
            { name: 'Harina panadera', quantity: '500g' },
            { name: 'Agua', quantity: '325ml' },
            { name: 'Sal', quantity: '10g' },
            { name: 'Levadura seca', quantity: '5g' },
        ],
        steps: [
            'Mezclar todos los ingredientes',
            'Amasar hasta desarrollar gluten',
            'Primera fermentación: 2 horas',
            'Dividir en 4 porciones',
            'Pre-formar y descansar 20 min',
            'Formar baguettes alargadas',
            'Segunda fermentación: 1 hora',
            'Hacer cortes diagonales',
            'Hornear con vapor a 240°C por 8 minutos'
        ],
        tips: [
            'La hidratación alta da mejor miga',
            'Los cortes deben ser rápidos y decididos',
            'El vapor es esencial para la corteza crujiente'
        ]
    },
    {
        id: '3',
        name: 'Brioche',
        category: 'Panadería Francesa',
        difficulty: 'Intermedio',
        prepTime: 300,
        bakingTime: 20,
        temperature: 180,
        yield: 12,
        rating: 4.7,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Huevos', quantity: '5 unidades' },
            { name: 'Mantequilla', quantity: '250g' },
            { name: 'Azúcar', quantity: '75g' },
            { name: 'Leche', quantity: '100ml' },
            { name: 'Levadura fresca', quantity: '20g' },
            { name: 'Sal', quantity: '10g' },
        ],
        steps: [
            'Activar levadura en leche tibia',
            'Mezclar harina, azúcar y sal',
            'Agregar huevos y levadura',
            'Amasar e incorporar mantequilla poco a poco',
            'Primera fermentación: 2 horas',
            'Refrigerar masa 2 horas',
            'Formar brioches',
            'Segunda fermentación: 1 hora',
            'Barnizar con huevo',
            'Hornear a 180°C por 20 minutos'
        ],
        tips: [
            'La mantequilla debe estar a temperatura ambiente',
            'El amasado es largo pero esencial',
            'Refrigerar ayuda a manejar la masa'
        ]
    },

    // PANADERÍA ARTESANAL
    {
        id: '4',
        name: 'Pan de Masa Madre',
        category: 'Panadería Artesanal',
        difficulty: 'Avanzado',
        prepTime: 1440, // 24 horas
        bakingTime: 25,
        temperature: 230,
        yield: 2,
        rating: 5.0,
        ingredients: [
            { name: 'Harina integral', quantity: '400g' },
            { name: 'Harina blanca', quantity: '100g' },
            { name: 'Masa madre activa', quantity: '150g' },
            { name: 'Agua', quantity: '350ml' },
            { name: 'Sal', quantity: '10g' },
        ],
        steps: [
            'Mezclar harina con agua y dejar autolisis 30 min',
            'Agregar masa madre y sal',
            'Amasar suavemente',
            'Fermentación bulk: 4-6 horas con pliegues cada hora',
            'Pre-formar y descansar 30 min',
            'Formar hogaza y colocar en banneton',
            'Fermentación final en frío: 12-18 horas',
            'Precalentar horno con piedra a 250°C',
            'Hacer cortes decorativos',
            'Hornear con vapor 25 minutos, bajar a 220°C'
        ],
        tips: [
            'La masa madre debe estar en su pico de actividad',
            'El vapor inicial es crucial para la corteza',
            'Dejar enfriar completamente antes de cortar'
        ]
    },
    {
        id: '5',
        name: 'Pan de Campo (Boule)',
        category: 'Panadería Artesanal',
        difficulty: 'Intermedio',
        prepTime: 480,
        bakingTime: 35,
        temperature: 220,
        yield: 1,
        rating: 4.8,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Agua', quantity: '350ml' },
            { name: 'Levadura seca', quantity: '7g' },
            { name: 'Sal', quantity: '10g' },
            { name: 'Azúcar', quantity: '5g' },
        ],
        steps: [
            'Mezclar agua tibia con levadura y azúcar',
            'Agregar harina y sal',
            'Amasar hasta masa elástica',
            'Primera fermentación: 3 horas',
            'Desgasificar y formar bola',
            'Segunda fermentación: 1 hora',
            'Hacer cortes en cruz',
            'Hornear a 220°C por 35 minutos'
        ],
        tips: [
            'La corteza debe sonar hueca al golpear',
            'Usar horno con vapor los primeros 10 minutos',
            'Dejar enfriar sobre rejilla'
        ]
    },
    {
        id: '6',
        name: 'Ciabatta',
        category: 'Panadería Artesanal',
        difficulty: 'Intermedio',
        prepTime: 360,
        bakingTime: 25,
        temperature: 220,
        yield: 4,
        rating: 4.6,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Agua', quantity: '375ml' },
            { name: 'Levadura fresca', quantity: '10g' },
            { name: 'Sal', quantity: '12g' },
            { name: 'Aceite de oliva', quantity: '30ml' },
        ],
        steps: [
            'Mezclar agua con levadura',
            'Agregar harina, sal y aceite',
            'Mezclar sin amasar demasiado',
            'Primera fermentación: 2 horas con pliegues',
            'Extender en rectángulo',
            'Cortar en 4 piezas',
            'Segunda fermentación: 1 hora',
            'Hornear a 220°C con vapor por 25 minutos'
        ],
        tips: [
            'La masa debe estar muy hidratada',
            'No amasar en exceso',
            'Los alvéolos grandes son característicos'
        ]
    },

    // PANADERÍA COLOMBIANA
    {
        id: '7',
        name: 'Pan Aliñado',
        category: 'Panadería Colombiana',
        difficulty: 'Fácil',
        prepTime: 120,
        bakingTime: 30,
        temperature: 160,
        yield: 12,
        rating: 4.9,
        ingredients: [
            { name: 'Harina de trigo', quantity: '1000g' },
            { name: 'Mantequilla', quantity: '300g' },
            { name: 'Azúcar', quantity: '100g' },
            { name: 'Sal', quantity: '20g' },
            { name: 'Levadura fresca', quantity: '40g' },
            { name: 'Huevos', quantity: '2 unidades' },
            { name: 'Esencia de mantequilla', quantity: '1 cucharada' },
            { name: 'Queso fresco', quantity: '200g' },
        ],
        steps: [
            'Mezclar harina, azúcar y sal',
            'Agregar mantequilla en trozos',
            'Incorporar huevos y levadura activada',
            'Agregar esencia de mantequilla',
            'Amasar hasta masa homogénea',
            'Dejar fermentar 1 hora',
            'Formar panes y rellenar con queso',
            'Decorar con queso rallado',
            'Segunda fermentación: 30 minutos',
            'Hornear a 160°C por 30 minutos'
        ],
        tips: [
            'El queso fresco da el sabor característico',
            'Decorar con queso parmesano antes de hornear',
            'Hacer cortes decorativos con cúter'
        ]
    },
    {
        id: '8',
        name: 'Pandebono',
        category: 'Panadería Colombiana',
        difficulty: 'Fácil',
        prepTime: 30,
        bakingTime: 15,
        temperature: 250,
        yield: 20,
        rating: 5.0,
        ingredients: [
            { name: 'Almidón de yuca', quantity: '250g' },
            { name: 'Almidón de maíz', quantity: '250g' },
            { name: 'Queso costeño rallado', quantity: '400g' },
            { name: 'Huevos', quantity: '2 unidades' },
            { name: 'Leche', quantity: '100ml' },
            { name: 'Mantequilla', quantity: '50g' },
            { name: 'Azúcar', quantity: '20g' },
        ],
        steps: [
            'Rallar el queso finamente',
            'Mezclar almidones con queso',
            'Agregar azúcar y mantequilla',
            'Incorporar huevo batido',
            'Agregar leche poco a poco',
            'Amasar hasta masa suave',
            'Formar bolitas o roscas',
            'Hornear a 250°C por 15 minutos hasta dorar'
        ],
        tips: [
            'Usar queso costeño o feta',
            'La masa debe quedar firme pero suave',
            'Servir calientes para mejor sabor'
        ]
    },
    {
        id: '9',
        name: 'Buñuelo Colombiano',
        category: 'Panadería Colombiana',
        difficulty: 'Intermedio',
        prepTime: 90,
        bakingTime: 5,
        temperature: 160,
        yield: 30,
        rating: 4.8,
        ingredients: [
            { name: 'Queso costeño molido', quantity: '500g' },
            { name: 'Fécula de maíz', quantity: '250g' },
            { name: 'Almidón de yuca', quantity: '250g' },
            { name: 'Huevos', quantity: '3 unidades' },
            { name: 'Azúcar', quantity: '50g' },
            { name: 'Polvo de hornear', quantity: '10g' },
            { name: 'Sal', quantity: '5g' },
            { name: 'Leche', quantity: '100ml' },
        ],
        steps: [
            'Mezclar queso con féculas',
            'Agregar azúcar, polvo de hornear y sal',
            'Incorporar huevos batidos',
            'Agregar leche gradualmente',
            'Amasar hasta masa homogénea',
            'Refrigerar 60-90 minutos',
            'Formar bolas del tamaño deseado',
            'Freír en aceite a 160°C hasta dorar',
            'Voltear cuando suban a la superficie'
        ],
        tips: [
            'Refrigerar la masa mejora la textura',
            'Los buñuelos se voltean solos al freír',
            'Servir calientes con chocolate'
        ]
    },
    {
        id: '10',
        name: 'Mogolla Chicharrona',
        category: 'Panadería Colombiana',
        difficulty: 'Intermedio',
        prepTime: 150,
        bakingTime: 15,
        temperature: 180,
        yield: 12,
        rating: 4.7,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Leche', quantity: '200ml' },
            { name: 'Mantequilla', quantity: '100g' },
            { name: 'Azúcar', quantity: '50g' },
            { name: 'Sal', quantity: '10g' },
            { name: 'Levadura seca', quantity: '10g' },
            { name: 'Huevo', quantity: '1 unidad' },
            { name: 'Esencia de vainilla', quantity: '1 cucharadita' },
            { name: 'Tocino para chicharrones', quantity: '200g' },
        ],
        steps: [
            'Preparar chicharrones: cortar tocino, remojar en agua con bicarbonato, secar y freír',
            'Activar levadura en agua tibia con azúcar',
            'Mezclar harina, azúcar, mantequilla y sal',
            'Agregar leche, huevo, vainilla y levadura',
            'Amasar hasta masa elástica',
            'Primera fermentación: 1 hora',
            'Dividir y aplanar porciones',
            'Rellenar con chicharrones',
            'Segunda fermentación: 30 minutos',
            'Hornear a 180°C por 15 minutos'
        ],
        tips: [
            'Los chicharrones deben estar crujientes',
            'Sellar bien los bordes al rellenar',
            'Servir tibias para mejor sabor'
        ]
    },

    // REPOSTERÍA
    {
        id: '11',
        name: 'Rol de Canela',
        category: 'Repostería',
        difficulty: 'Fácil',
        prepTime: 120,
        bakingTime: 15,
        temperature: 180,
        yield: 12,
        rating: 4.7,
        ingredients: [
            { name: 'Harina', quantity: '400g' },
            { name: 'Leche', quantity: '200ml' },
            { name: 'Mantequilla', quantity: '100g' },
            { name: 'Azúcar', quantity: '80g' },
            { name: 'Huevos', quantity: '2 unidades' },
            { name: 'Levadura', quantity: '10g' },
            { name: 'Canela en polvo', quantity: '30g' },
            { name: 'Queso crema para glasear', quantity: '200g' },
        ],
        steps: [
            'Mezclar ingredientes secos',
            'Agregar leche tibia, huevos y mantequilla',
            'Amasar hasta masa suave',
            'Primera fermentación: 1 hora',
            'Extender en rectángulo',
            'Untar mantequilla, espolvorear canela y azúcar',
            'Enrollar y cortar en 12 porciones',
            'Segunda fermentación: 30 minutos',
            'Hornear a 180°C por 15 minutos',
            'Glasear con queso crema mientras están tibios'
        ],
        tips: [
            'No enrollar demasiado apretado',
            'El glaseado se pone cuando están tibios',
            'Usar hilo dental para cortar sin aplastar'
        ]
    },
    {
        id: '12',
        name: 'Conchas Mexicanas',
        category: 'Repostería',
        difficulty: 'Intermedio',
        prepTime: 180,
        bakingTime: 18,
        temperature: 180,
        yield: 16,
        rating: 4.8,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Azúcar', quantity: '100g' },
            { name: 'Mantequilla', quantity: '100g' },
            { name: 'Huevos', quantity: '2 unidades' },
            { name: 'Leche', quantity: '150ml' },
            { name: 'Levadura', quantity: '15g' },
            { name: 'Sal', quantity: '5g' },
            { name: 'Para la cobertura: harina', quantity: '150g' },
            { name: 'Para la cobertura: azúcar glass', quantity: '150g' },
            { name: 'Para la cobertura: mantequilla', quantity: '100g' },
        ],
        steps: [
            'Preparar masa: mezclar ingredientes y amasar',
            'Primera fermentación: 1.5 horas',
            'Preparar cobertura: mezclar harina, azúcar glass y mantequilla',
            'Formar bolas de masa',
            'Cubrir con pasta de cobertura',
            'Hacer diseño de concha con cuchillo',
            'Segunda fermentación: 30 minutos',
            'Hornear a 180°C por 18 minutos'
        ],
        tips: [
            'La cobertura debe tener consistencia de plastilina',
            'Hacer diseños decorativos con cuchillo',
            'No sobre-hornear para mantener suavidad'
        ]
    },
    {
        id: '13',
        name: 'Donas Glaseadas',
        category: 'Repostería',
        difficulty: 'Intermedio',
        prepTime: 120,
        bakingTime: 3,
        temperature: 180,
        yield: 20,
        rating: 4.6,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Azúcar', quantity: '100g' },
            { name: 'Leche', quantity: '250ml' },
            { name: 'Mantequilla', quantity: '75g' },
            { name: 'Huevos', quantity: '2 unidades' },
            { name: 'Levadura', quantity: '15g' },
            { name: 'Sal', quantity: '5g' },
            { name: 'Esencia de vainilla', quantity: '1 cucharadita' },
            { name: 'Azúcar glass para glasear', quantity: '300g' },
        ],
        steps: [
            'Activar levadura en leche tibia',
            'Mezclar harina, azúcar y sal',
            'Agregar huevos, mantequilla y levadura',
            'Amasar hasta masa suave',
            'Primera fermentación: 1 hora',
            'Extender masa y cortar donas',
            'Segunda fermentación: 30 minutos',
            'Freír en aceite a 180°C por 1.5 min cada lado',
            'Glasear con azúcar glass y leche'
        ],
        tips: [
            'El aceite debe estar a temperatura constante',
            'Glasear cuando estén tibias',
            'Decorar con chispas o chocolate'
        ]
    },

    // PANES INTEGRALES Y SALUDABLES
    {
        id: '14',
        name: 'Pan Integral de Semillas',
        category: 'Panes Saludables',
        difficulty: 'Fácil',
        prepTime: 150,
        bakingTime: 40,
        temperature: 200,
        yield: 1,
        rating: 4.5,
        ingredients: [
            { name: 'Harina integral', quantity: '400g' },
            { name: 'Harina blanca', quantity: '100g' },
            { name: 'Agua', quantity: '350ml' },
            { name: 'Levadura seca', quantity: '10g' },
            { name: 'Miel', quantity: '30g' },
            { name: 'Sal', quantity: '10g' },
            { name: 'Semillas mixtas (girasol, sésamo, lino)', quantity: '100g' },
            { name: 'Aceite de oliva', quantity: '30ml' },
        ],
        steps: [
            'Mezclar harinas con semillas',
            'Activar levadura en agua tibia con miel',
            'Agregar levadura, aceite y sal a harinas',
            'Amasar hasta masa homogénea',
            'Primera fermentación: 1 hora',
            'Formar hogaza',
            'Segunda fermentación: 30 minutos',
            'Decorar con semillas',
            'Hornear a 200°C por 40 minutos'
        ],
        tips: [
            'Tostar las semillas antes para más sabor',
            'La miel ayuda a la fermentación',
            'Dejar enfriar completamente antes de cortar'
        ]
    },
    {
        id: '15',
        name: 'Pan de Avena y Miel',
        category: 'Panes Saludables',
        difficulty: 'Fácil',
        prepTime: 120,
        bakingTime: 35,
        temperature: 180,
        yield: 1,
        rating: 4.6,
        ingredients: [
            { name: 'Harina de trigo', quantity: '400g' },
            { name: 'Avena en hojuelas', quantity: '100g' },
            { name: 'Agua', quantity: '300ml' },
            { name: 'Miel', quantity: '50g' },
            { name: 'Levadura seca', quantity: '10g' },
            { name: 'Sal', quantity: '8g' },
            { name: 'Aceite', quantity: '30ml' },
        ],
        steps: [
            'Remojar avena en agua tibia 15 minutos',
            'Activar levadura con miel',
            'Mezclar harina con sal',
            'Agregar avena, levadura y aceite',
            'Amasar hasta masa elástica',
            'Primera fermentación: 1 hora',
            'Formar pan',
            'Segunda fermentación: 30 minutos',
            'Decorar con avena',
            'Hornear a 180°C por 35 minutos'
        ],
        tips: [
            'La avena da textura húmeda',
            'Decorar con avena y miel antes de hornear',
            'Excelente para tostadas'
        ]
    },

    // PANES ESPECIALES
    {
        id: '16',
        name: 'Focaccia Italiana',
        category: 'Panes Especiales',
        difficulty: 'Fácil',
        prepTime: 180,
        bakingTime: 25,
        temperature: 220,
        yield: 8,
        rating: 4.7,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Agua', quantity: '350ml' },
            { name: 'Aceite de oliva', quantity: '100ml' },
            { name: 'Levadura seca', quantity: '10g' },
            { name: 'Sal', quantity: '12g' },
            { name: 'Romero fresco', quantity: '2 ramas' },
            { name: 'Sal gruesa', quantity: 'al gusto' },
        ],
        steps: [
            'Mezclar agua con levadura y azúcar',
            'Agregar harina, sal y 50ml de aceite',
            'Amasar suavemente',
            'Primera fermentación: 2 horas',
            'Extender en bandeja aceitada',
            'Hacer hoyos con los dedos',
            'Agregar aceite, romero y sal gruesa',
            'Segunda fermentación: 30 minutos',
            'Hornear a 220°C por 25 minutos'
        ],
        tips: [
            'Los hoyos retienen el aceite y hierbas',
            'Usar aceite de oliva de calidad',
            'Servir tibia con aceite extra'
        ]
    },
    {
        id: '17',
        name: 'Bagels',
        category: 'Panes Especiales',
        difficulty: 'Intermedio',
        prepTime: 180,
        bakingTime: 20,
        temperature: 220,
        yield: 12,
        rating: 4.5,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Agua', quantity: '300ml' },
            { name: 'Azúcar', quantity: '30g' },
            { name: 'Levadura seca', quantity: '10g' },
            { name: 'Sal', quantity: '10g' },
            { name: 'Miel para hervir', quantity: '50g' },
            { name: 'Semillas de sésamo', quantity: '50g' },
        ],
        steps: [
            'Mezclar agua tibia con levadura y azúcar',
            'Agregar harina y sal',
            'Amasar hasta masa firme',
            'Primera fermentación: 1 hora',
            'Formar aros',
            'Segunda fermentación: 30 minutos',
            'Hervir en agua con miel 1 min cada lado',
            'Decorar con semillas',
            'Hornear a 220°C por 20 minutos'
        ],
        tips: [
            'El hervido da la textura característica',
            'La masa debe ser firme',
            'Perfectos para sándwiches'
        ]
    },
    {
        id: '18',
        name: 'Pretzel Alemán',
        category: 'Panes Especiales',
        difficulty: 'Intermedio',
        prepTime: 150,
        bakingTime: 15,
        temperature: 200,
        yield: 10,
        rating: 4.6,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Agua', quantity: '300ml' },
            { name: 'Levadura seca', quantity: '10g' },
            { name: 'Azúcar', quantity: '20g' },
            { name: 'Sal', quantity: '10g' },
            { name: 'Mantequilla', quantity: '50g' },
            { name: 'Bicarbonato de sodio', quantity: '50g' },
            { name: 'Sal gruesa', quantity: 'al gusto' },
        ],
        steps: [
            'Activar levadura en agua con azúcar',
            'Mezclar harina, sal y mantequilla',
            'Agregar levadura y amasar',
            'Primera fermentación: 1 hora',
            'Formar pretzels',
            'Sumergir en agua con bicarbonato 30 segundos',
            'Colocar en bandeja',
            'Espolvorear sal gruesa',
            'Hornear a 200°C por 15 minutos'
        ],
        tips: [
            'El bicarbonato da el color característico',
            'La forma tradicional es importante',
            'Servir con mostaza'
        ]
    },

    // PANES DULCES
    {
        id: '19',
        name: 'Pan de Chocolate',
        category: 'Panes Dulces',
        difficulty: 'Intermedio',
        prepTime: 150,
        bakingTime: 25,
        temperature: 180,
        yield: 12,
        rating: 4.8,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Cacao en polvo', quantity: '50g' },
            { name: 'Azúcar', quantity: '100g' },
            { name: 'Leche', quantity: '250ml' },
            { name: 'Mantequilla', quantity: '100g' },
            { name: 'Huevos', quantity: '2 unidades' },
            { name: 'Levadura', quantity: '15g' },
            { name: 'Chispas de chocolate', quantity: '150g' },
        ],
        steps: [
            'Mezclar harina con cacao y azúcar',
            'Activar levadura en leche tibia',
            'Agregar mantequilla, huevos y levadura',
            'Amasar e incorporar chispas',
            'Primera fermentación: 1 hora',
            'Formar panes',
            'Segunda fermentación: 30 minutos',
            'Hornear a 180°C por 25 minutos'
        ],
        tips: [
            'Usar cacao de calidad',
            'Las chispas se agregan al final',
            'Delicioso tibio con leche'
        ]
    },
    {
        id: '20',
        name: 'Pan de Pasas y Nueces',
        category: 'Panes Dulces',
        difficulty: 'Fácil',
        prepTime: 150,
        bakingTime: 30,
        temperature: 180,
        yield: 1,
        rating: 4.5,
        ingredients: [
            { name: 'Harina de trigo', quantity: '500g' },
            { name: 'Agua', quantity: '300ml' },
            { name: 'Azúcar morena', quantity: '80g' },
            { name: 'Levadura seca', quantity: '10g' },
            { name: 'Sal', quantity: '8g' },
            { name: 'Canela', quantity: '5g' },
            { name: 'Pasas', quantity: '150g' },
            { name: 'Nueces picadas', quantity: '100g' },
            { name: 'Mantequilla', quantity: '50g' },
        ],
        steps: [
            'Remojar pasas en agua tibia',
            'Activar levadura con azúcar',
            'Mezclar harina, sal y canela',
            'Agregar levadura, mantequilla y agua',
            'Amasar e incorporar pasas y nueces',
            'Primera fermentación: 1 hora',
            'Formar hogaza',
            'Segunda fermentación: 30 minutos',
            'Hornear a 180°C por 30 minutos'
        ],
        tips: [
            'Tostar las nueces antes',
            'Las pasas deben estar bien escurridas',
            'Excelente para desayuno'
        ]
    },

    // RECETAS ADICIONALES 21-70 (50 NUEVAS)

    // MÁS PANADERÍA FRANCESA
    {
        id: '21', name: 'Pain au Chocolat', category: 'Panadería Francesa', difficulty: 'Avanzado', prepTime: 240, bakingTime: 22, temperature: 200, yield: 12, rating: 4.9,
        ingredients: [{ name: 'Harina de fuerza', quantity: '500g' }, { name: 'Mantequilla para laminar', quantity: '250g' }, { name: 'Leche', quantity: '200ml' }, { name: 'Azúcar', quantity: '50g' }, { name: 'Levadura', quantity: '20g' }, { name: 'Chocolate', quantity: '24 barras' }],
        steps: ['Preparar masa base', 'Refrigerar 1h', 'Laminar con mantequilla', 'Realizar 3 pliegues', 'Cortar y rellenar con chocolate', 'Fermentar 2h', 'Hornear 200°C 12min + 180°C 10min'],
        tips: ['Mantequilla a 14°C', 'Vapor al inicio', 'Enfriar antes de servir']
    },

    {
        id: '22', name: 'Éclair', category: 'Panadería Francesa', difficulty: 'Avanzado', prepTime: 90, bakingTime: 30, temperature: 200, yield: 14, rating: 4.8,
        ingredients: [{ name: 'Agua', quantity: '100ml' }, { name: 'Leche', quantity: '100ml' }, { name: 'Mantequilla', quantity: '100g' }, { name: 'Harina', quantity: '150g' }, { name: 'Huevos', quantity: '4 uds' }, { name: 'Crema pastelera', quantity: '500ml' }, { name: 'Chocolate', quantity: '200g' }],
        steps: ['Hervir líquidos con mantequilla', 'Agregar harina de golpe', 'Incorporar huevos', 'Formar bastones', 'Hornear 220°C 15min + 180°C 15min', 'Rellenar y glasear'],
        tips: ['No abrir horno', 'Masa brillante', 'Madurar 24h']
    },

    {
        id: '23', name: 'Macaron', category: 'Panadería Francesa', difficulty: 'Avanzado', prepTime: 120, bakingTime: 15, temperature: 150, yield: 30, rating: 4.7,
        ingredients: [{ name: 'Harina de almendras', quantity: '140g' }, { name: 'Azúcar glas', quantity: '140g' }, { name: 'Claras', quantity: '110g' }, { name: 'Azúcar', quantity: '140g' }, { name: 'Agua', quantity: '40ml' }],
        steps: ['Tamizar almendras', 'Merengue italiano 118°C', 'Macaronage', 'Formar círculos', 'Secar 1-2h', 'Hornear 150°C 15min', 'Rellenar', 'Madurar 24h'],
        tips: ['Precisión clave', 'Control humedad', 'Termómetro para almíbar']
    },

    {
        id: '24', name: 'Madeleine', category: 'Panadería Francesa', difficulty: 'Fácil', prepTime: 60, bakingTime: 10, temperature: 200, yield: 24, rating: 4.6,
        ingredients: [{ name: 'Harina', quantity: '125g' }, { name: 'Azúcar', quantity: '125g' }, { name: 'Huevos', quantity: '3 uds' }, { name: 'Mantequilla', quantity: '125g' }, { name: 'Miel', quantity: '20g' }, { name: 'Limón rallado', quantity: '1 ud' }],
        steps: ['Batir huevos y azúcar', 'Agregar miel', 'Incorporar harina', 'Añadir mantequilla', 'Refrigerar 1h', 'Hornear 200°C 10min'],
        tips: ['Moldes engrasados', 'Joroba con frío', 'Servir mismo día']
    },

    {
        id: '25', name: 'Financier', category: 'Panadería Francesa', difficulty: 'Fácil', prepTime: 30, bakingTime: 12, temperature: 180, yield: 20, rating: 4.5,
        ingredients: [{ name: 'Mantequilla avellana', quantity: '100g' }, { name: 'Azúcar glas', quantity: '100g' }, { name: 'Harina almendras', quantity: '50g' }, { name: 'Harina', quantity: '30g' }, { name: 'Claras', quantity: '4 uds' }],
        steps: ['Preparar mantequilla avellana', 'Mezclar secos', 'Batir claras', 'Combinar todo', 'Hornear 180°C 12min'],
        tips: ['Mantequilla dorada', 'Moldes pequeños', 'Textura húmeda']
    },

    // MÁS PANADERÍA ARTESANAL
    {
        id: '26', name: 'Pan de Centeno', category: 'Panadería Artesanal', difficulty: 'Intermedio', prepTime: 480, bakingTime: 45, temperature: 200, yield: 1, rating: 4.7,
        ingredients: [{ name: 'Harina centeno', quantity: '300g' }, { name: 'Harina trigo', quantity: '200g' }, { name: 'Agua', quantity: '350ml' }, { name: 'Levadura', quantity: '10g' }, { name: 'Sal', quantity: '12g' }, { name: 'Miel', quantity: '20g' }],
        steps: ['Mezclar harinas', 'Activar levadura', 'Amasar', 'Fermentar 3h', 'Formar', 'Segunda fermentación 1h', 'Hornear 200°C 45min'],
        tips: ['Masa pegajosa', 'Sabor intenso', 'Conserva varios días']
    },

    {
        id: '27', name: 'Chapata', category: 'Panadería Artesanal', difficulty: 'Intermedio', prepTime: 300, bakingTime: 25, temperature: 230, yield: 2, rating: 4.6,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Agua', quantity: '400ml' }, { name: 'Levadura', quantity: '8g' }, { name: 'Sal', quantity: '12g' }, { name: 'Aceite oliva', quantity: '30ml' }],
        steps: ['Mezclar sin amasar', 'Fermentar 2h con pliegues', 'Extender', 'Cortar', 'Fermentar 1h', 'Hornear con vapor 230°C 25min'],
        tips: ['Alta hidratación', 'No amasar', 'Alvéolos grandes']
    },

    {
        id: '28', name: 'Pan Gallego', category: 'Panadería Artesanal', difficulty: 'Intermedio', prepTime: 360, bakingTime: 40, temperature: 220, yield: 1, rating: 4.8,
        ingredients: [{ name: 'Harina panadera', quantity: '500g' }, { name: 'Agua', quantity: '325ml' }, { name: 'Levadura', quantity: '8g' }, { name: 'Sal', quantity: '12g' }],
        steps: ['Amasar bien', 'Fermentar 2h', 'Formar bola', 'Fermentar 1h', 'Cortar cruz profunda', 'Hornear 220°C 40min'],
        tips: ['Corteza gruesa', 'Miga densa', 'Corte profundo']
    },

    // MÁS PANADERÍA COLOMBIANA
    {
        id: '29', name: 'Almojábana', category: 'Panadería Colombiana', difficulty: 'Fácil', prepTime: 30, bakingTime: 20, temperature: 200, yield: 15, rating: 4.9,
        ingredients: [{ name: 'Harina maíz', quantity: '250g' }, { name: 'Queso rallado', quantity: '300g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Mantequilla', quantity: '50g' }, { name: 'Azúcar', quantity: '20g' }],
        steps: ['Mezclar harina y queso', 'Agregar huevos', 'Añadir mantequilla', 'Formar bolitas', 'Hornear 200°C 20min'],
        tips: ['Queso fresco', 'Servir calientes', 'Textura esponjosa']
    },

    {
        id: '30', name: 'Pan de Yuca', category: 'Panadería Colombiana', difficulty: 'Fácil', prepTime: 25, bakingTime: 18, temperature: 220, yield: 20, rating: 5.0,
        ingredients: [{ name: 'Almidón yuca', quantity: '500g' }, { name: 'Queso', quantity: '400g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Leche', quantity: '100ml' }, { name: 'Mantequilla', quantity: '50g' }],
        steps: ['Mezclar almidón y queso', 'Agregar huevos y leche', 'Amasar', 'Formar bolitas', 'Hornear 220°C 18min'],
        tips: ['Sin gluten', 'Queso costeño', 'Comer caliente']
    },

    {
        id: '31', name: 'Roscón Colombiano', category: 'Panadería Colombiana', difficulty: 'Intermedio', prepTime: 150, bakingTime: 25, temperature: 180, yield: 1, rating: 4.7,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Azúcar', quantity: '100g' }, { name: 'Mantequilla', quantity: '100g' }, { name: 'Huevos', quantity: '3 uds' }, { name: 'Leche', quantity: '150ml' }, { name: 'Levadura', quantity: '15g' }],
        steps: ['Mezclar ingredientes', 'Amasar', 'Fermentar 1h', 'Formar rosca', 'Fermentar 30min', 'Hornear 180°C 25min'],
        tips: ['Decorar con frutas', 'Glasear', 'Tradicional navideño']
    },

    // MÁS REPOSTERÍA
    {
        id: '32', name: 'Churros', category: 'Repostería', difficulty: 'Fácil', prepTime: 30, bakingTime: 5, temperature: 180, yield: 30, rating: 4.9,
        ingredients: [{ name: 'Harina', quantity: '250g' }, { name: 'Agua', quantity: '250ml' }, { name: 'Mantequilla', quantity: '50g' }, { name: 'Sal', quantity: '5g' }, { name: 'Azúcar', quantity: '200g' }, { name: 'Canela', quantity: '10g' }],
        steps: ['Hervir agua con mantequilla', 'Agregar harina', 'Mezclar bien', 'Formar churros', 'Freír 180°C', 'Rebozar en azúcar-canela'],
        tips: ['Aceite caliente', 'Manga con estrella', 'Servir calientes']
    },

    {
        id: '33', name: 'Palmeras', category: 'Repostería', difficulty: 'Fácil', prepTime: 45, bakingTime: 15, temperature: 200, yield: 20, rating: 4.6,
        ingredients: [{ name: 'Masa hojaldre', quantity: '1 lámina' }, { name: 'Azúcar', quantity: '200g' }],
        steps: ['Espolvorear azúcar', 'Enrollar desde bordes', 'Cortar rodajas', 'Hornear 200°C 15min'],
        tips: ['Azúcar generoso', 'Voltear a mitad', 'Caramelizar bien']
    },

    {
        id: '34', name: 'Napolitanas', category: 'Repostería', difficulty: 'Intermedio', prepTime: 180, bakingTime: 18, temperature: 190, yield: 12, rating: 4.7,
        ingredients: [{ name: 'Masa hojaldre', quantity: '500g' }, { name: 'Chocolate', quantity: '200g' }, { name: 'Crema pastelera', quantity: '200g' }],
        steps: ['Extender hojaldre', 'Cortar rectángulos', 'Rellenar mitad', 'Doblar', 'Barnizar', 'Hornear 190°C 18min'],
        tips: ['Sellar bien bordes', 'Chocolate de calidad', 'Glasear opcional']
    },

    // MÁS PANES SALUDABLES
    {
        id: '35', name: 'Pan de Quinoa', category: 'Panes Saludables', difficulty: 'Intermedio', prepTime: 150, bakingTime: 40, temperature: 190, yield: 1, rating: 4.6,
        ingredients: [{ name: 'Harina integral', quantity: '300g' }, { name: 'Quinoa cocida', quantity: '200g' }, { name: 'Agua', quantity: '300ml' }, { name: 'Levadura', quantity: '10g' }, { name: 'Miel', quantity: '30g' }, { name: 'Sal', quantity: '10g' }],
        steps: ['Cocinar quinoa', 'Mezclar con harina', 'Activar levadura', 'Amasar', 'Fermentar 1h', 'Formar', 'Fermentar 30min', 'Hornear 190°C 40min'],
        tips: ['Alto en proteína', 'Textura húmeda', 'Sin gluten opcional']
    },

    {
        id: '36', name: 'Pan Sin Gluten', category: 'Panes Saludables', difficulty: 'Intermedio', prepTime: 120, bakingTime: 45, temperature: 180, yield: 1, rating: 4.5,
        ingredients: [{ name: 'Harina arroz', quantity: '200g' }, { name: 'Harina maíz', quantity: '150g' }, { name: 'Almidón yuca', quantity: '100g' }, { name: 'Huevos', quantity: '3 uds' }, { name: 'Agua', quantity: '300ml' }, { name: 'Levadura', quantity: '12g' }],
        steps: ['Mezclar harinas', 'Batir huevos', 'Combinar', 'Fermentar 1h', 'Hornear 180°C 45min'],
        tips: ['Textura diferente', 'Usar gomas', 'Molde engrasado']
    },

    {
        id: '37', name: 'Pan Proteico', category: 'Panes Saludables', difficulty: 'Fácil', prepTime: 90, bakingTime: 35, temperature: 180, yield: 1, rating: 4.4,
        ingredients: [{ name: 'Harina integral', quantity: '300g' }, { name: 'Proteína en polvo', quantity: '100g' }, { name: 'Claras', quantity: '4 uds' }, { name: 'Agua', quantity: '250ml' }, { name: 'Levadura', quantity: '10g' }],
        steps: ['Mezclar secos', 'Agregar líquidos', 'Amasar', 'Fermentar 45min', 'Hornear 180°C 35min'],
        tips: ['Alto en proteína', 'Bajo en carbohidratos', 'Ideal fitness']
    },

    // MÁS PANES ESPECIALES
    {
        id: '38', name: 'Naan Indio', category: 'Panes Especiales', difficulty: 'Fácil', prepTime: 120, bakingTime: 5, temperature: 250, yield: 8, rating: 4.8,
        ingredients: [{ name: 'Harina', quantity: '400g' }, { name: 'Yogur', quantity: '150g' }, { name: 'Agua', quantity: '100ml' }, { name: 'Levadura', quantity: '8g' }, { name: 'Azúcar', quantity: '10g' }, { name: 'Sal', quantity: '8g' }],
        steps: ['Mezclar ingredientes', 'Amasar', 'Fermentar 1h', 'Dividir', 'Extender', 'Cocinar sartén 2min/lado'],
        tips: ['Muy caliente', 'Untar mantequilla', 'Ajo opcional']
    },

    {
        id: '39', name: 'Pita', category: 'Panes Especiales', difficulty: 'Fácil', prepTime: 90, bakingTime: 5, temperature: 250, yield: 10, rating: 4.7,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Agua', quantity: '300ml' }, { name: 'Levadura', quantity: '10g' }, { name: 'Sal', quantity: '10g' }, { name: 'Aceite', quantity: '30ml' }],
        steps: ['Amasar', 'Fermentar 1h', 'Dividir', 'Extender círculos', 'Hornear 250°C 5min'],
        tips: ['Horno muy caliente', 'Se infla', 'Bolsillo interior']
    },

    {
        id: '40', name: 'Tortillas Mexicanas', category: 'Panes Especiales', difficulty: 'Fácil', prepTime: 45, bakingTime: 2, temperature: 200, yield: 15, rating: 4.6,
        ingredients: [{ name: 'Harina maíz', quantity: '400g' }, { name: 'Agua tibia', quantity: '300ml' }, { name: 'Sal', quantity: '5g' }],
        steps: ['Mezclar harina y sal', 'Agregar agua', 'Amasar', 'Formar bolitas', 'Aplanar', 'Cocinar comal 1min/lado'],
        tips: ['Masa suave', 'Comal caliente', 'Guardar en paño']
    },

    // MÁS PANES DULCES
    {
        id: '41', name: 'Pan de Plátano', category: 'Panes Dulces', difficulty: 'Fácil', prepTime: 20, bakingTime: 60, temperature: 180, yield: 1, rating: 4.8,
        ingredients: [{ name: 'Plátanos maduros', quantity: '3 uds' }, { name: 'Harina', quantity: '300g' }, { name: 'Azúcar', quantity: '150g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Mantequilla', quantity: '100g' }, { name: 'Polvo hornear', quantity: '10g' }],
        steps: ['Triturar plátanos', 'Mezclar secos', 'Batir húmedos', 'Combinar', 'Hornear 180°C 60min'],
        tips: ['Plátanos muy maduros', 'Nueces opcionales', 'Probar con palillo']
    },

    {
        id: '42', name: 'Pan de Zanahoria', category: 'Panes Dulces', difficulty: 'Fácil', prepTime: 30, bakingTime: 50, temperature: 180, yield: 1, rating: 4.7,
        ingredients: [{ name: 'Zanahoria rallada', quantity: '300g' }, { name: 'Harina', quantity: '300g' }, { name: 'Azúcar', quantity: '200g' }, { name: 'Huevos', quantity: '3 uds' }, { name: 'Aceite', quantity: '150ml' }, { name: 'Canela', quantity: '10g' }],
        steps: ['Rallar zanahorias', 'Mezclar secos', 'Batir húmedos', 'Combinar', 'Hornear 180°C 50min'],
        tips: ['Zanahoria fresca', 'Glaseado queso crema', 'Húmedo y esponjoso']
    },

    {
        id: '43', name: 'Babka', category: 'Panes Dulces', difficulty: 'Avanzado', prepTime: 240, bakingTime: 40, temperature: 180, yield: 2, rating: 4.9,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Azúcar', quantity: '100g' }, { name: 'Mantequilla', quantity: '150g' }, { name: 'Huevos', quantity: '3 uds' }, { name: 'Leche', quantity: '150ml' }, { name: 'Chocolate', quantity: '200g' }, { name: 'Levadura', quantity: '15g' }],
        steps: ['Preparar masa', 'Fermentar 2h', 'Extender', 'Untar chocolate', 'Enrollar y trenzar', 'Fermentar 1h', 'Hornear 180°C 40min'],
        tips: ['Trenzado característico', 'Glasear', 'Muy mantecoso']
    },

    // RECETAS INTERNACIONALES ADICIONALES
    {
        id: '44', name: 'Panettone', category: 'Panes Dulces', difficulty: 'Avanzado', prepTime: 720, bakingTime: 45, temperature: 180, yield: 1, rating: 5.0,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Azúcar', quantity: '150g' }, { name: 'Mantequilla', quantity: '200g' }, { name: 'Huevos', quantity: '5 uds' }, { name: 'Levadura', quantity: '20g' }, { name: 'Frutas confitadas', quantity: '200g' }, { name: 'Pasas', quantity: '100g' }],
        steps: ['Preparar masa madre', 'Primera fermentación 4h', 'Agregar frutas', 'Segunda fermentación 4h', 'Hornear 180°C 45min'],
        tips: ['Proceso largo', 'Frutas de calidad', 'Tradicional navideño']
    },

    {
        id: '45', name: 'Stollen', category: 'Panes Dulces', difficulty: 'Avanzado', prepTime: 480, bakingTime: 60, temperature: 170, yield: 2, rating: 4.8,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Mantequilla', quantity: '250g' }, { name: 'Azúcar', quantity: '100g' }, { name: 'Frutas secas', quantity: '300g' }, { name: 'Almendras', quantity: '100g' }, { name: 'Especias', quantity: '10g' }],
        steps: ['Remojar frutas', 'Preparar masa', 'Fermentar 3h', 'Incorporar frutas', 'Formar', 'Fermentar 1h', 'Hornear 170°C 60min', 'Cubrir azúcar glas'],
        tips: ['Alemán tradicional', 'Madurar días', 'Muy aromático']
    },

    {
        id: '46', name: 'Rosca de Reyes', category: 'Panes Dulces', difficulty: 'Intermedio', prepTime: 180, bakingTime: 30, temperature: 180, yield: 1, rating: 4.9,
        ingredients: [{ name: 'Harina', quantity: '600g' }, { name: 'Azúcar', quantity: '150g' }, { name: 'Mantequilla', quantity: '150g' }, { name: 'Huevos', quantity: '4 uds' }, { name: 'Leche', quantity: '150ml' }, { name: 'Frutas confitadas', quantity: '150g' }],
        steps: ['Preparar masa', 'Fermentar 2h', 'Formar rosca', 'Decorar frutas', 'Fermentar 30min', 'Hornear 180°C 30min'],
        tips: ['Tradicional mexicana', 'Esconder muñeco', 'Azúcar decorativa']
    },

    // PANES RÚSTICOS
    {
        id: '47', name: 'Pan de Pueblo', category: 'Panadería Artesanal', difficulty: 'Intermedio', prepTime: 360, bakingTime: 50, temperature: 220, yield: 1, rating: 4.7,
        ingredients: [{ name: 'Harina panadera', quantity: '500g' }, { name: 'Agua', quantity: '350ml' }, { name: 'Levadura', quantity: '8g' }, { name: 'Sal', quantity: '12g' }],
        steps: ['Amasar bien', 'Fermentar 3h', 'Formar hogaza rústica', 'Fermentar 1h', 'Cortes profundos', 'Hornear 220°C 50min'],
        tips: ['Corteza gruesa', 'Miga densa', 'Horno con vapor']
    },

    {
        id: '48', name: 'Pan de Aceitunas', category: 'Panadería Artesanal', difficulty: 'Intermedio', prepTime: 240, bakingTime: 35, temperature: 200, yield: 1, rating: 4.6,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Agua', quantity: '325ml' }, { name: 'Aceitunas negras', quantity: '150g' }, { name: 'Levadura', quantity: '10g' }, { name: 'Sal', quantity: '10g' }, { name: 'Aceite oliva', quantity: '30ml' }],
        steps: ['Amasar', 'Incorporar aceitunas', 'Fermentar 2h', 'Formar', 'Fermentar 1h', 'Hornear 200°C 35min'],
        tips: ['Aceitunas sin hueso', 'Sabor mediterráneo', 'Aceite de calidad']
    },

    {
        id: '49', name: 'Pan de Nueces', category: 'Panadería Artesanal', difficulty: 'Intermedio', prepTime: 240, bakingTime: 40, temperature: 200, yield: 1, rating: 4.7,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Agua', quantity: '325ml' }, { name: 'Nueces tostadas', quantity: '200g' }, { name: 'Levadura', quantity: '10g' }, { name: 'Miel', quantity: '30g' }, { name: 'Sal', quantity: '10g' }],
        steps: ['Tostar nueces', 'Amasar masa', 'Incorporar nueces', 'Fermentar 2h', 'Formar', 'Fermentar 1h', 'Hornear 200°C 40min'],
        tips: ['Nueces frescas', 'Tostar antes', 'Miel opcional']
    },

    {
        id: '50', name: 'Pan Multicereales', category: 'Panes Saludables', difficulty: 'Intermedio', prepTime: 180, bakingTime: 45, temperature: 190, yield: 1, rating: 4.6,
        ingredients: [{ name: 'Harina integral', quantity: '300g' }, { name: 'Harina blanca', quantity: '200g' }, { name: 'Semillas mixtas', quantity: '100g' }, { name: 'Avena', quantity: '50g' }, { name: 'Agua', quantity: '350ml' }, { name: 'Levadura', quantity: '10g' }, { name: 'Miel', quantity: '30g' }],
        steps: ['Mezclar harinas y semillas', 'Activar levadura', 'Amasar', 'Fermentar 1.5h', 'Formar', 'Fermentar 45min', 'Decorar semillas', 'Hornear 190°C 45min'],
        tips: ['Muy nutritivo', 'Semillas variadas', 'Textura densa']
    },

    // ESPECIALIDADES INTERNACIONALES
    {
        id: '51', name: 'Challah', category: 'Panes Especiales', difficulty: 'Intermedio', prepTime: 180, bakingTime: 30, temperature: 180, yield: 1, rating: 4.8,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Huevos', quantity: '3 uds' }, { name: 'Azúcar', quantity: '80g' }, { name: 'Aceite', quantity: '80ml' }, { name: 'Agua', quantity: '150ml' }, { name: 'Levadura', quantity: '12g' }, { name: 'Sal', quantity: '10g' }],
        steps: ['Mezclar ingredientes', 'Amasar', 'Fermentar 1.5h', 'Dividir en 3', 'Trenzar', 'Fermentar 45min', 'Barnizar huevo', 'Hornear 180°C 30min'],
        tips: ['Pan judío tradicional', 'Trenzado característico', 'Muy esponjoso']
    },

    {
        id: '52', name: 'Ciabattini', category: 'Panes Especiales', difficulty: 'Intermedio', prepTime: 240, bakingTime: 15, temperature: 220, yield: 8, rating: 4.5,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Agua', quantity: '375ml' }, { name: 'Levadura', quantity: '8g' }, { name: 'Sal', quantity: '12g' }, { name: 'Aceite oliva', quantity: '30ml' }],
        steps: ['Mezclar sin amasar mucho', 'Fermentar 2h con pliegues', 'Dividir en porciones', 'Fermentar 1h', 'Hornear 220°C 15min'],
        tips: ['Versión pequeña ciabatta', 'Alta hidratación', 'Perfectos bocadillos']
    },

    {
        id: '53', name: 'Ensaimada', category: 'Repostería', difficulty: 'Avanzado', prepTime: 480, bakingTime: 15, temperature: 180, yield: 8, rating: 4.9,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Azúcar', quantity: '100g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Manteca cerdo', quantity: '200g' }, { name: 'Agua', quantity: '150ml' }, { name: 'Levadura', quantity: '15g' }],
        steps: ['Preparar masa', 'Fermentar 2h', 'Extender muy fino', 'Untar manteca', 'Enrollar en espiral', 'Fermentar 4h', 'Hornear 180°C 15min', 'Espolvorear azúcar glas'],
        tips: ['Mallorquina tradicional', 'Muy delicada', 'Manteca esencial']
    },

    {
        id: '54', name: 'Orejas', category: 'Repostería', difficulty: 'Fácil', prepTime: 60, bakingTime: 15, temperature: 200, yield: 16, rating: 4.6,
        ingredients: [{ name: 'Masa hojaldre', quantity: '1 lámina' }, { name: 'Azúcar', quantity: '150g' }],
        steps: ['Espolvorear azúcar', 'Enrollar desde ambos lados', 'Cortar rodajas', 'Hornear 200°C 15min'],
        tips: ['Similar a palmeras', 'Caramelizar bien', 'Crujientes']
    },

    {
        id: '55', name: 'Cuernitos', category: 'Repostería', difficulty: 'Intermedio', prepTime: 180, bakingTime: 18, temperature: 190, yield: 12, rating: 4.7,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Mantequilla', quantity: '100g' }, { name: 'Azúcar', quantity: '80g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Leche', quantity: '150ml' }, { name: 'Levadura', quantity: '12g' }],
        steps: ['Preparar masa dulce', 'Fermentar 1.5h', 'Extender y cortar triángulos', 'Enrollar', 'Fermentar 45min', 'Barnizar', 'Hornear 190°C 18min'],
        tips: ['Versión dulce croissant', 'Más esponjosos', 'Glasear opcional']
    },

    {
        id: '56', name: 'Trenzas Dulces', category: 'Repostería', difficulty: 'Intermedio', prepTime: 150, bakingTime: 25, temperature: 180, yield: 2, rating: 4.6,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Azúcar', quantity: '100g' }, { name: 'Mantequilla', quantity: '100g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Leche', quantity: '200ml' }, { name: 'Levadura', quantity: '12g' }, { name: 'Pasas', quantity: '100g' }],
        steps: ['Preparar masa', 'Fermentar 1h', 'Dividir en 3', 'Trenzar', 'Fermentar 30min', 'Barnizar', 'Hornear 180°C 25min'],
        tips: ['Trenzado decorativo', 'Pasas opcionales', 'Glasear al final']
    },

    {
        id: '57', name: 'Caracolas', category: 'Repostería', difficulty: 'Fácil', prepTime: 120, bakingTime: 20, temperature: 180, yield: 12, rating: 4.7,
        ingredients: [{ name: 'Harina', quantity: '400g' }, { name: 'Azúcar', quantity: '80g' }, { name: 'Mantequilla', quantity: '80g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Leche', quantity: '150ml' }, { name: 'Levadura', quantity: '10g' }, { name: 'Chocolate', quantity: '100g' }],
        steps: ['Preparar masa', 'Fermentar 1h', 'Extender', 'Untar chocolate', 'Enrollar y cortar', 'Fermentar 30min', 'Hornear 180°C 20min'],
        tips: ['Forma de caracol', 'Relleno variado', 'Glasear opcional']
    },

    {
        id: '58', name: 'Suizos', category: 'Repostería', difficulty: 'Intermedio', prepTime: 150, bakingTime: 15, temperature: 190, yield: 10, rating: 4.8,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Azúcar', quantity: '100g' }, { name: 'Mantequilla', quantity: '100g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Leche', quantity: '200ml' }, { name: 'Levadura', quantity: '15g' }, { name: 'Crema pastelera', quantity: '300g' }],
        steps: ['Preparar masa', 'Fermentar 1h', 'Formar bollos', 'Rellenar con crema', 'Fermentar 30min', 'Barnizar', 'Hornear 190°C 15min'],
        tips: ['Rellenos de crema', 'Muy esponjosos', 'Populares en México']
    },

    {
        id: '59', name: 'Berlinesas', category: 'Repostería', difficulty: 'Intermedio', prepTime: 120, bakingTime: 5, temperature: 180, yield: 15, rating: 4.7,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Azúcar', quantity: '80g' }, { name: 'Mantequilla', quantity: '80g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Leche', quantity: '200ml' }, { name: 'Levadura', quantity: '15g' }, { name: 'Mermelada', quantity: '200g' }],
        steps: ['Preparar masa', 'Fermentar 1h', 'Formar bolas', 'Fermentar 30min', 'Freír 180°C', 'Rellenar con mermelada', 'Espolvorear azúcar'],
        tips: ['Freír con cuidado', 'Rellenar frías', 'Azúcar generoso']
    },

    {
        id: '60', name: 'Bombas', category: 'Repostería', difficulty: 'Intermedio', prepTime: 90, bakingTime: 5, temperature: 180, yield: 12, rating: 4.6,
        ingredients: [{ name: 'Harina', quantity: '400g' }, { name: 'Azúcar', quantity: '60g' }, { name: 'Mantequilla', quantity: '60g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Leche', quantity: '180ml' }, { name: 'Levadura', quantity: '12g' }, { name: 'Crema', quantity: '250g' }],
        steps: ['Preparar masa', 'Fermentar 45min', 'Formar bolas', 'Freír 180°C', 'Rellenar con crema', 'Glasear chocolate'],
        tips: ['Similares a berlinesas', 'Relleno cremoso', 'Glasear chocolate']
    },

    {
        id: '61', name: 'Lionesas', category: 'Repostería', difficulty: 'Avanzado', prepTime: 90, bakingTime: 30, temperature: 200, yield: 20, rating: 4.8,
        ingredients: [{ name: 'Agua', quantity: '100ml' }, { name: 'Leche', quantity: '100ml' }, { name: 'Mantequilla', quantity: '100g' }, { name: 'Harina', quantity: '150g' }, { name: 'Huevos', quantity: '4 uds' }, { name: 'Crema', quantity: '400g' }, { name: 'Chocolate', quantity: '150g' }],
        steps: ['Preparar masa choux', 'Formar bolitas', 'Hornear 220°C 15min + 180°C 15min', 'Rellenar con crema', 'Glasear chocolate'],
        tips: ['Masa choux perfecta', 'No abrir horno', 'Rellenar frías']
    },

    {
        id: '62', name: 'Pan de Muerto', category: 'Panes Dulces', difficulty: 'Intermedio', prepTime: 180, bakingTime: 30, temperature: 180, yield: 2, rating: 4.9,
        ingredients: [{ name: 'Harina', quantity: '600g' }, { name: 'Azúcar', quantity: '150g' }, { name: 'Mantequilla', quantity: '150g' }, { name: 'Huevos', quantity: '4 uds' }, { name: 'Leche', quantity: '150ml' }, { name: 'Levadura', quantity: '15g' }, { name: 'Ralladura naranja', quantity: '2 uds' }],
        steps: ['Preparar masa aromática', 'Fermentar 2h', 'Formar pan con huesos', 'Fermentar 30min', 'Hornear 180°C 30min', 'Cubrir azúcar'],
        tips: ['Tradicional mexicano', 'Aroma naranja', 'Decoración huesos']
    },

    {
        id: '63', name: 'Pan de Calabaza', category: 'Panes Dulces', difficulty: 'Fácil', prepTime: 30, bakingTime: 55, temperature: 180, yield: 1, rating: 4.7,
        ingredients: [{ name: 'Puré calabaza', quantity: '300g' }, { name: 'Harina', quantity: '300g' }, { name: 'Azúcar', quantity: '200g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Aceite', quantity: '100ml' }, { name: 'Especias', quantity: '10g' }],
        steps: ['Preparar puré', 'Mezclar secos', 'Batir húmedos', 'Combinar', 'Hornear 180°C 55min'],
        tips: ['Calabaza cocida', 'Especias otoñales', 'Húmedo y aromático']
    },

    {
        id: '64', name: 'Bagel de Canela', category: 'Panes Especiales', difficulty: 'Intermedio', prepTime: 180, bakingTime: 20, temperature: 220, yield: 12, rating: 4.6,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Agua', quantity: '300ml' }, { name: 'Azúcar morena', quantity: '50g' }, { name: 'Levadura', quantity: '10g' }, { name: 'Canela', quantity: '15g' }, { name: 'Pasas', quantity: '100g' }],
        steps: ['Preparar masa con canela', 'Fermentar 1h', 'Formar aros', 'Fermentar 30min', 'Hervir con miel', 'Hornear 220°C 20min'],
        tips: ['Variante dulce', 'Pasas opcionales', 'Perfecto desayuno']
    },

    {
        id: '65', name: 'Focaccia de Romero', category: 'Panes Especiales', difficulty: 'Fácil', prepTime: 180, bakingTime: 25, temperature: 220, yield: 8, rating: 4.8,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Agua', quantity: '350ml' }, { name: 'Aceite oliva', quantity: '100ml' }, { name: 'Levadura', quantity: '10g' }, { name: 'Romero fresco', quantity: '3 ramas' }, { name: 'Sal gruesa', quantity: 'al gusto' }],
        steps: ['Mezclar ingredientes', 'Fermentar 2h', 'Extender en bandeja', 'Hacer hoyos', 'Agregar romero y aceite', 'Fermentar 30min', 'Hornear 220°C 25min'],
        tips: ['Aceite generoso', 'Romero fresco', 'Sal gruesa']
    },

    {
        id: '66', name: 'Pan de Ajo', category: 'Panes Especiales', difficulty: 'Fácil', prepTime: 120, bakingTime: 20, temperature: 200, yield: 1, rating: 4.7,
        ingredients: [{ name: 'Baguette', quantity: '1 ud' }, { name: 'Mantequilla', quantity: '150g' }, { name: 'Ajo picado', quantity: '6 dientes' }, { name: 'Perejil', quantity: '30g' }, { name: 'Queso rallado', quantity: '100g' }],
        steps: ['Mezclar mantequilla con ajo', 'Cortar baguette', 'Untar mezcla', 'Agregar queso', 'Hornear 200°C 20min'],
        tips: ['Mantequilla a temperatura ambiente', 'Ajo fresco', 'Servir caliente']
    },

    {
        id: '67', name: 'Pan de Cerveza', category: 'Panadería Artesanal', difficulty: 'Fácil', prepTime: 90, bakingTime: 40, temperature: 190, yield: 1, rating: 4.5,
        ingredients: [{ name: 'Harina', quantity: '500g' }, { name: 'Cerveza', quantity: '330ml' }, { name: 'Azúcar', quantity: '30g' }, { name: 'Levadura', quantity: '10g' }, { name: 'Sal', quantity: '10g' }],
        steps: ['Mezclar ingredientes', 'Amasar', 'Fermentar 45min', 'Formar', 'Hornear 190°C 40min'],
        tips: ['Cerveza a temperatura ambiente', 'Sabor único', 'Corteza crujiente']
    },

    {
        id: '68', name: 'Pan de Especias', category: 'Panes Dulces', difficulty: 'Fácil', prepTime: 30, bakingTime: 50, temperature: 180, yield: 1, rating: 4.6,
        ingredients: [{ name: 'Harina', quantity: '300g' }, { name: 'Miel', quantity: '150g' }, { name: 'Azúcar morena', quantity: '100g' }, { name: 'Huevos', quantity: '2 uds' }, { name: 'Mantequilla', quantity: '100g' }, { name: 'Especias mixtas', quantity: '20g' }],
        steps: ['Mezclar secos con especias', 'Batir húmedos', 'Combinar', 'Hornear 180°C 50min'],
        tips: ['Especias frescas', 'Miel de calidad', 'Aromático']
    },

    {
        id: '69', name: 'Pan Germinado', category: 'Panes Saludables', difficulty: 'Avanzado', prepTime: 2880, bakingTime: 40, temperature: 180, yield: 1, rating: 4.7,
        ingredients: [{ name: 'Granos germinados', quantity: '400g' }, { name: 'Harina integral', quantity: '200g' }, { name: 'Agua', quantity: '200ml' }, { name: 'Levadura', quantity: '8g' }, { name: 'Sal', quantity: '10g' }, { name: 'Miel', quantity: '30g' }],
        steps: ['Germinar granos 2-3 días', 'Moler parcialmente', 'Mezclar con harina', 'Amasar', 'Fermentar 2h', 'Hornear 180°C 40min'],
        tips: ['Muy nutritivo', 'Proceso largo', 'Textura densa']
    },

    {
        id: '70', name: 'Pan Keto', category: 'Panes Saludables', difficulty: 'Fácil', prepTime: 20, bakingTime: 30, temperature: 180, yield: 1, rating: 4.4,
        ingredients: [{ name: 'Harina almendras', quantity: '200g' }, { name: 'Huevos', quantity: '5 uds' }, { name: 'Queso crema', quantity: '100g' }, { name: 'Polvo hornear', quantity: '10g' }, { name: 'Sal', quantity: '5g' }],
        steps: ['Batir huevos', 'Agregar queso crema', 'Incorporar secos', 'Hornear 180°C 30min'],
        tips: ['Bajo en carbohidratos', 'Alto en grasas', 'Textura diferente']
    }
];

export default BAKERY_RECIPES;
