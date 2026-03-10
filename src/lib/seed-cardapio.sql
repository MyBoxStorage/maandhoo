-- Bebidas
INSERT INTO cardapio (categoria, nome, descricao, preco, disponivel, destaque, ordem) VALUES
('drinks',   'Gin Tropical',        'Gin & Red Bull Tropical',           35,  true, false, 1),
('drinks',   'Caipirinha',          'Vodka, limão e açúcar',             25,  true, false, 2),
('longneck', 'Cerveja Budweiser',   'Long Neck 330ml',                   25,  true, false, 3),
('longneck', 'Heineken',            'Long Neck 330ml',                   28,  true, false, 4),
('doses',    'Vodka Absolut',       'Dose',                              30,  true, false, 5),
('doses',    'Jack Daniels',        'Dose',                              35,  true, false, 6),
('soft',     'Red Bull',            'Lata 250ml',                        28,  true, false, 7),
('soft',     'Água com Gás',        'Garrafa 500ml',                     12,  true, false, 8),
('combos',   'Vodka Absolut 750ml', '+5 Softs R$419 · +5 Red Bulls R$499', 359, true, true,  1),
('combos',   'Gin Beefeater 750ml', '+5 Softs R$479 · +5 Red Bulls R$559', 419, true, true,  2);
