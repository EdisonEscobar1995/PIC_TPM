$(function(){
	$("#general").show();
})

function guardar(){
	var nombreCampo = $(".ckeditor-field").attr("name");
	var cadena = $('#cke_'+nombreCampo+' iframe').contents().find('body').html();
	cadena = cadena.replace(/<[^>]+>/g,'');
	
	if (cadena == "") {
		bAlert("Por favor, ingrese un contenido");
		return false;
	}
	document.forms[0].submit();
}