// Form validation 2

function Validator(formSelector) {
    var _this = this;
    var formRules = {};

    function getParent(element, selector) {
        // create a loop to find the parent element of selector => loop until find '.form-group'
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) { 
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    /*
    * Rule-making convention
    * 1. error => return `error message`
    * 2. no error => return `undefined`
    */
    var validatorRules = {
        required: function (value) {
            return value ? undefined : "Please fill this field";
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Please enter an email address";
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Please enter at least ${min} characters`;
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Please enter maximum ${max} characters`;
            }
        }
    };

    // get form element in DOM by formSelector
    var formElement = document.querySelector(formSelector);

    // only handle when there is an element in the DOM
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');

        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');

            for (var rule of rules) { 
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    // console.log(ruleInfo); => min:6

                    rule = ruleInfo[0]; //min; ruleInfo[1] = 6

                    //console.log(validatorRules[rule](ruleInfo[1]));
                }

                //min has function inside return a function => take the last function to get value 6
                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]); //6
                }

                // console.log(rule);

                if (Array.isArray(formRules[input.name])) {
                    //2nd time: check if formRules is an array
                    formRules[input.name].push(ruleFunc);
                    
                } else {
                    //1st time: formRules is an empty object
                    formRules[input.name] = [ruleFunc];
                }         
            }

            // Event Listener to validate (blur, change)

            input.onblur = handleValidate;
            input.oninput = handleClearError;
 
        }

        //validate
        function handleValidate(event) {

            var rules = formRules[event.target.name];
            var errorMessage;

            for ( var rule of rules ) {
                errorMessage = rule(event.target.value);

                if (errorMessage) break;
            }

            //if there is an error => display error message
            if (errorMessage) { 
                // console.log(event.target);
                var formGroup = getParent(event.target, '.form-group');

                if (formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) { 
                        formMessage.innerText = errorMessage; 
                    }
                };

                // Shorter code
                // if (!formGroup) return;
                // var formMessage = formGroup.querySelector('.form-message');
                // if (formMessage) { 
                //     formMessage.innerText = errorMessage; 
                // }
            }

            //convert to boolean and reverse value
            //no error => !errorMessage => true
            return !errorMessage;
        }

        //clear error message
        function handleClearError() {
            var formGroup = getParent(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
                var formMessage = formGroup.querySelector('.form-message');
                if (formMessage) { 
                    formMessage.innerText = ''; 
                }
            }
        }

    }
    
    // handle form submit behavior
    formElement.onsubmit = function (event) { 
        event.preventDefault();
        console.log(_this);

        var inputs = formElement.querySelectorAll('[name][rules]');

        var isValid = true;

        for (var input of inputs) {
            //function handleValidate(event.target) 
            //event.target is element of input
            // {} is an event
            //target => target: input
            // if there is an error => !handleValidate({target: input})
            if (!handleValidate({target: input})) {
                isValid = false;
            };
        }
        console.log(isValid);


        //no error => submit form
        if (isValid) {
            //Case 1: submit with javascript
            //If there is onSubmit as a function
            if (typeof _this.onSubmit === 'function') { 
                // Get all input with Attribute name
                var enableInputs = formElement.querySelectorAll('[name]'); //NodeList
                //convert NodeList to array to use reduce
                var formValues = Array.from(enableInputs).reduce(function (values, input) {

                    // Reduce to key:value to object then finally return values as an object
                    switch(input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            // Check if array is empty then assign string '
                            if (!input.matches(':checked')) {
                                values[input.name] = '';
                                return values;
                            }

                            // If not checked, value is an array
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }

                            // If checked then push to array
                            values[input.name].push(input.value);
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }

                    return values;
                }, {});

                // Callback and pass in data
                _this.onSubmit(formValues);
            } else {
                //Case 2: submit with default behavior
                formElement.submit();
            }

            //way 2
            // if (typeof _this.onSubmit === 'function') { 
            //     return _this.onSubmit();
            // }
            // formElement.submit();
        }
    }

    // console.log(formRules);
}