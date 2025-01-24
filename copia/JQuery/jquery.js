$(document).ready(function(){
    $('#input1, #input2').on('input', function(){

        var input1 = $('#input1').val();
        var input2 = $('#input2').val();

        if(isNaN(input1) || isNaN(input2)) {
            $('#result').text('Eres bobo mete un numero valido');
            return
        }

        var suma = parseFloat(input1) + parseFloat(input2);

        $('#result').text('Esta es la suma:' + suma);
    })
});