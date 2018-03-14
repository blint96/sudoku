var SudokuClass = (function () {
    // private static
    var nextId = 1;
    
    // constructor
    var cls = function (element) {
        // private
        var id = nextId++;
        var name = 'Unknown';
        var container = element;
        var block = false;

        var stackHotfix = 0;
        
        var tiles = new Array();
        for(let i = 0; i < 9; i++)
            tiles[i] = new Array();

        // public (this instance only)
        this.get_id = function () { return id; };

        this.get_name = function () { return name; };
        this.set_name = function (value) {
            if (typeof value != 'string')
                throw 'Name must be a string';
            if (value.length < 2 || value.length > 20)
                throw 'Name must be 2-20 characters long.';
            name = value;
        };

        this.load_array = function(array) {
            console.log(array);
            for(let x = 0; x < 9; x++) {
                for(let y = 0; y < 9; y++) {
                    if(typeof array[x][y] !== "undefined")
                        this.input(y, x, array[x][y].toString());
                }
            }
        };

        //
        this.dump_array = function() {
            console.log(tiles);
            return tiles;
        };

        //
        this.is_completed = function()
        {
            let completed = true;
            for(let x = 0; x < 9; x++) {
                for(let y = 0; y < 9; y++) {
                    if(parseInt(tiles[x][y]) <= 0 || typeof tiles[x][y] == 'undefined')
                        completed = false;
                }
            }
            return completed;
        };

        // change value of input
        this.input = function(x, y, value) {
            if(this.valid_tile(x, y, value)) {
                $('.x-' + x).find('.tile-' + y).find('.ipt-sudoku').val(value);
                return true;
            } else {
                return false;
            }
        };

        //
        this.clear_input = function(x, y) {
            $('.x-' + x).find('.tile-' + y).find('.ipt-sudoku').val('');
            tiles[x][y] = undefined;
        }

        // hotfix
        this.solveFunction = function(clearFlag = true) {
            var counter = 0;
            while(this.is_completed() == false) {
                this.solve(0);
                counter += 1;

                if(!clearFlag && counter > 50) {
                    //alert('Prawdopodobnie brak jakiegokolwiek rozwiązania.');
                    this.solveFunction();
                    return false;
                }

                if(counter > 50 && clearFlag) {
                    counter = 0;
                    this.clear_board();
                }
            }
            return true;
        };

        // solve sudoku
        // Max call stack problem - this.solveFunction "repairs" it
        this.solve = function(step, skipValue = -1)
        {
            stackHotfix += 1;
            if(stackHotfix > 3500) {
                stackHotfix = 0;
                return;
            }

            if(step < 81) {
                if (step == 0) {
                    let startValue = Math.floor(Math.random() * 9) + 1;
                    this.input(0, 0, startValue);
                    return this.solve(step + 1);
                }

                // prepare value, x and y
                let x = step % 9;
                let y = Math.floor(step / 9);

                let found = false;
                let value = Math.floor(Math.random() * 9) + 1;

                if(value != skipValue && this.input(x, y, value))
                    return this.solve(step + 1);

                for(let i = 1; i <= 9; i++) {
                    if(i == skipValue) continue;

                    if(this.input(x, y, i)) {
                        found = true;
                        return this.solve(step + 1);
                    }
                }

                if(!found) {
                    let tX = ((step - 1) % 9);
                    let tY = Math.floor((step - 1) / 9);
                    return this.solve(step - 1, tiles[tX][tY]);
                }

                return this.solve(step + 1);
            }
        };

        // check for tile
        this.valid_tile = function(x, y, valueStr) {
            //let value = parseInt($(this).val());
            let value = parseInt(valueStr);
            if((value < 1 || value > 9) || isNaN(value) && valueStr.length > 0) {
                //alert('Wartość nie może być mniejsza niż 1 i większa niż 9!');
                //return $(this).val('');
                return false;
            }

            // this y & x
            //let y = parseInt($(this).closest('.tile').data("y"));
            //let x = parseInt($(this).closest('.row').data('x'));

            let start_quarter_x = 0;
            let start_quarter_y = 0;

            // który x i ktory y
            if(y > 0 && y < 3)
                start_quarter_y = 0;
            else if(y >= 3 && y < 6)
                start_quarter_y = 3;
            else if(y >= 6)
                start_quarter_y = 6;
            if(x > 0 && x < 3)
                start_quarter_x = 0;
            else if(x >= 3 && x < 6)
                start_quarter_x = 3;
            else if(x >= 6)
                start_quarter_x = 6;

            for(let tx = 0; tx < 9; tx++) {
                for(let ty = 0; ty < 9; ty++) {
                    if(tx == x && ty == y)
                        continue;

                    // sprawdzanie osi X
                    if(tx == x) {
                        if(typeof tiles[tx][ty] !== undefined && typeof tiles[tx][ty] !== NaN) {
                            if(parseInt(tiles[tx][ty]) == value) {
                                //alert('Już istnieje taka wartość w tym wierszu lub kolumnie!');
                                //$(this).val('');
                                return false;
                            }
                        }
                    }

                    // sprawdzanie osi Y
                    if(ty == y) {
                        if(typeof tiles[tx][ty] !== undefined && typeof tiles[tx][ty] !== NaN) {
                            if(parseInt(tiles[tx][ty]) == value) {
                                //alert('Już istnieje taka wartość w tym wierszu lub kolumnie!');
                                //$(this).val('');
                                return false;
                            }
                        }
                    }

                    // sprawdzanie kwadrata
                    if(tx >= start_quarter_x && tx < (start_quarter_x + 3) && ty >= start_quarter_y && ty < (start_quarter_y + 3)) {
                        if(typeof tiles[tx][ty] !== undefined && typeof tiles[tx][ty] !== NaN) {
                            if(parseInt(tiles[tx][ty]) == value) {
                                //alert('Już istnieje taka wartość w tym kwadracie!');
                                //$(this).val('');
                                return false;
                            }
                        }
                    }

                }
            }

            tiles[x][y] = value;
            block = false;
            return true;
        };
        
        // handle inputs
        this.ipt_handlers = function() {
            $('.ipt-sudoku').keyup(function() {
                let value = $(this).val();
                let y = parseInt($(this).closest('.tile').data("y"));
                let x = parseInt($(this).closest('.row').data('x'));
                
                if(!game.valid_tile(x, y, value))
                    $(this).val('');
            });
        }
        
        // render
        this.gen = function() {
            container.empty();
            for(let x = 0; x < 9; x++) {
                container.append('<div data-x="'+x+'" class="row x-' + x + '">');
                for(let y = 0; y < 9; y++) {
                    let value = Math.floor(Math.random() * 9) + 1 ;
                    tiles[x][y] = value;
                    
                    let extraBorder = '';
                    if(y == 2 || y == 5) 
                        extraBorder += ' tile-border-right';
                    if(x == 2 || x == 5)
                        extraBorder += ' tile-border-bottom';
                    $('.x-' + x).append('<div class="col-md-1 tile-border' + extraBorder + '"><div data-y="' + y + '" class="tile tile-' + y + '"><input class="ipt-sudoku" type="text" value="' + tiles[x][y] + '" /></div></div>');
                }
                container.append('</div>');
            }
            this.ipt_handlers();
        };
        
        // generate valid array
        this.raw_map = function() {
            container.empty();
            for(let x = 0; x < 9; x++) {
                container.append('<div data-x="'+x+'" class="row x-' + x + '">');
                for(let y = 0; y < 9; y++) {
                    
                    let extraBorder = '';
                    if(y == 2 || y == 5) 
                        extraBorder += ' tile-border-right';
                    if(x == 2 || x == 5)
                        extraBorder += ' tile-border-bottom';
                    $('.x-' + x).append('<div class="col-md-1 tile-border' + extraBorder + '"><div data-y="'+y+'" class="tile tile-' + y + '"><input class="ipt-sudoku" type="text" /></div></div>');
                }
                container.append('</div>');
            }
            this.ipt_handlers();
        };

        //
        this.clear_board = function()
        {
            for(let x = 0; x < 9; x++) {
                for(let y = 0; y < 9; y++) {
                    this.clear_input(x, y);
                }
            }
            return true;
        };

        // create game
        this.create_game = function(difficulty) {
            // TODO: game difficulty
            this.clear_board();
            if(this.solveFunction() == true) {
                for(let x = 0; x < 9; x++) {
                    for(let y = 0; y < 9; y++) {
                        let random = Math.floor(Math.random() * 10) + 1;
                        if(random < difficulty) {
                            this.clear_input(x, y);
                        }
                    }
                }
            }
        };
    };

    // public static
    cls.get_nextId = function () {
        return nextId;
    };

    // public (shared across instances)
    cls.prototype = {
        announce: function () {
            alert('Hi there! My id is ' + this.get_id() + ' and my name is "' + this.get_name() + '"!\r\n' +
                  'The next fellow\'s id will be ' + SudokuClass.get_nextId() + '!');
        }
    };

    return cls;
})(); 
