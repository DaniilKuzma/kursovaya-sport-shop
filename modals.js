$(document).ready(function() {
    $(".callback").click(function() {
        $(".callback-modal").css("display", "inline-block");
    });

    $(".feedback").click(function() {
        $(".feedback-modal").css("display", "inline-block");
    });

    $(document).click(function(event) {
        if ($(event.target).is(".callback-modal")) {
            $(".callback-modal").css("display", "none");
        }
        if ($(event.target).is(".feedback-modal")) {
            $(".feedback-modal").css("display", "none");
        }
    });

    // Валидация форм
    $(".feedback-modal .form").submit(function(e) {
        e.preventDefault();
        let isValid = true;
        let errorMessage = "";

        const feedbackName = $("#feedback-name").val();
        if (feedbackName.length < 2) {
            isValid = false;
            errorMessage += "Имя должно содержать минимум 2 символа\n";
            $("#feedback-name").css('border-color', '#ff4444');
        } else {
            $("#feedback-name").css('border-color', '#01A256');
        }

        const feedbackEmail = $("#feedback-email").val();
        const emailRegexFeedback = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegexFeedback.test(feedbackEmail)) {
            isValid = false;
            errorMessage += "Введите корректный email\n";
            $("#feedback-email").css('border-color', '#ff4444');
        } else {
            $("#feedback-email").css('border-color', '#01A256');
        }

        const feedbackMessage = $("#feedback-message").val();
        if (feedbackMessage.length < 10) {
            isValid = false;
            errorMessage += "Сообщение должно содержать минимум 10 символов\n";
            $("#feedback-message").css('border-color', '#ff4444');
        } else {
            $("#feedback-message").css('border-color', '#01A256');
        }

        handleFormSubmit(isValid, errorMessage, this, "Сообщение успешно отправлено!");
    });

    $(".callback-modal .form").submit(function(e) {
        e.preventDefault();
        let isValid = true;
        let errorMessage = "";

        const callbackName = $("#callback-name").val();
        if (callbackName.length < 2) {
            isValid = false;
            errorMessage += "Имя должно содержать минимум 2 символа\n";
            $("#callback-name").css('border-color', '#ff4444');
        } else {
            $("#callback-name").css('border-color', '#01A256');
        }

        const callbackPhone = $("#callback-phone").val().replace(/[^0-9]/g, '');
        if (callbackPhone.length < 11) {
            isValid = false;
            errorMessage += "Введите корректный номер телефона\n";
            $("#callback-phone").css('border-color', '#ff4444');
        } else {
            $("#callback-phone").css('border-color', '#01A256');
        }

        const callbackTime = $("#callback-time").val();
        if (!callbackTime) {
            isValid = false;
            errorMessage += "Выберите удобное время для звонка\n";
            $("#callback-time").css('border-color', '#ff4444');
        } else {
            $("#callback-time").css('border-color', '#01A256');
        }

        handleFormSubmit(isValid, errorMessage, this, "Заявка на обратный звонок принята!");
    });

    function handleFormSubmit(isValid, errorMessage, form, successMessage) {
        if (!isValid) {
            alert(errorMessage);
        } else {
            alert(successMessage);
            $(form).closest('.modal').css("display", "none");
            form.reset();
        }
    }
});
