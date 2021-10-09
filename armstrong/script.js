const checkBtnEle = document.getElementById("checkbtn");
const resultEle = document.getElementById("result");
//get button element

checkBtnEle.addEventListener("click", () => {
    let input = document.getElementById("inputnum").value;

    var startTime = performance.now(), endTime;

    let result = checkArmstrong(input, "initial");

    resultEle.innerHTML = '';
    if (result.isArmstrong) {
        endTime = performance.now();
        resultEle.innerHTML = `
        <h4>${input} is an Armstrong number</h4>
        <p>Time taken: ${endTime - startTime} ms</p>
        <p>Space taken: ${result.size} bytes</p>`
    }
    else {
        let res = [], original = input;

        while (res.length == 0) {
            input++;
            if (checkArmstrong(input, "latter").isArmstrong)
                res.push(input);
        }

        for (let i = original - 1; i > 0; i--) {
            if (checkArmstrong(i, "latter").isArmstrong) {
                res.push(i);
                break;
            }
        }
        
        res = res.sort(function(a, b) { return a - b });
        endTime = performance.now();

        resultEle.innerHTML = `<h4>${original} is not an Armstrong number</h4>
        <p>Nearest Armstrong numbers are: ${res[0]} and ${res[1]}</p>
        <p>Time taken: ${endTime - startTime} ms</p>
        <p>Space taken: ${result.size * ((original - res[0]) + (res[1] - original) )} bytes</p>`;
    }
});
//catch button click events

function checkArmstrong(num, stage) {
    let inpStr = String(num), length = inpStr.length; //get power based on length
    let numArr = inpStr.split(""), res = 0; //split into separate numbers

    numArr.forEach(element => {
        res += Math.pow(element, length);
    });

    if (res == num) {
        if(stage == "initial") 
            return{ isArmstrong: true, size: sizeOf(inpStr) + sizeOf(length) + sizeOf(numArr) + sizeOf(res) };
        else return{ isArmstrong: true };
    }
    else {
        if(stage == "initial") 
            return { isArmstrong: false, size: sizeOf(inpStr) + sizeOf(length) + sizeOf(numArr) + sizeOf(res) };
        else return { isArmstrong: false }
    }
}

function sizeOf(obj) {
    let bytes = 0;
    if(obj !== null && obj !== undefined) {
        switch(typeof obj) {
        case 'number':
            bytes += 8;
            break;
        case 'string':
            bytes += obj.length * 2;
            break;
        case 'boolean':
            bytes += 4;
            break;
        case 'object':
            var objClass = Object.prototype.toString.call(obj).slice(8, -1);
            if(objClass === 'Object' || objClass === 'Array') {
                for(var key in obj) {
                    if(!obj.hasOwnProperty(key)) continue;
                    sizeOf(obj[key]);
                }
            } else bytes += obj.toString().length * 2;
            break;
        }
    }
    return bytes;
};