// INCOME AND CRIME SCATTERPLOT

d3.csv("data/Crime_LQ_income_2018.csv", function(data) {

    //empty arrays/variables for scatter points and regression line
    var chartdata = [];
    var regdata = [];
    var r;

    //draw chart using chartdata
    const chart = Highcharts.chart('scatter-container', {

    chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy',
        animation: true,
        backgroundColor: '#31525B',
        style: {
          fontFamily: "'Lato', sans-serif"
        }
    },

    title: {
      text:''
    },

    legend: {
        enabled: false
    },

    xAxis: {
        gridLineWidth: 1,
        title: {
            text: 'Mean annual income in 2018 (GBP)',
            style: {
              color: '#fff'
            }
        },
        labels: {
            format: '{value}',
            style: {
              color: '#fff'
            }
        },
        gridLineWidth: 0.2
    },

    yAxis: {
        startOnTick: false,
        endOnTick: false,
        title: {
            text: 'Location quotient',
            style: {
              color: '#fff'
            }
        },
        labels: {
          style: {
              color: '#fff'
            }
          },
        maxPadding: 0.2,
        plotLines: [{
            color: '#fff',
            dashStyle: 'dot',
            width: 2,
            value: 1,
            label: {
                align: 'right',
                style: {
                    fontStyle: 'italic',
                    color: '#fff'
                },
                text: 'Citywide share of crime in category',
                x: -10
            },
            zIndex: 3
        }],
        gridLineWidth: 0.2
    },

    tooltip: {
        useHTML: true,
        headerFormat: '<table>',
        pointFormat: '<tr><th colspan="2"><h3>{point.name}</h3></th></tr>' +
            '<tr><th>2018 mean annual income:</th><td>{point.x}</td></tr>' +
            '<tr><th>Concentration of crime type relative<br>to citywide concentration:</th><td>{point.y:.2f}</td></tr>' +
            '<tr><th>Total crime:</th><td>{point.z:.2f}</td></tr>',
        footerFormat: '</table>',
        followPointer: true
    },

    plotOptions: {
      bubble: {
            minSize: 5,
            maxSize: 20,
            sizeBy: 'width',
        },
      line: {
        lineWidth: 5
      }
    },

    series: [{
        data: chartdata,
        color: 'rgba(255,161,1,0.15)'
    },
    {
      type: 'line',
      data: regdata,
      color: 'rgba(255,161,1,1)',
      r: r,
      tooltip: {
        useHTML: true,
        pointFormat: '<b>Correlation coefficient:</b> ' + this.r
      }
    }]

  });

  //calculate how much more or less concentrated a crime is in one area
  //function getProp(x) {
  //    return (x - 1) * 100;
  //}

  //calculate regression line
  //code adapted from https://www.highcharts.com/blog/tutorials/calculating-and-drawing-a-linear-regression-using-highcharts/
  function regression(category, income) {
    //income is an array corresponding to income column, 
    //category is an array corresponding to column of given crime category
      let r, sy, sx, b, a, meanX, meanY;
      r = jStat.corrcoeff(income, category);
      sy = jStat.stdev(category);
      sx = jStat.stdev(income);
      meanY = jStat(category).mean();
      meanX = jStat(income).mean();
      b = r * (sy / sx);
      a = meanY - meanX * b;
      //Set up a line
      let x1, x2, y1, y2;
      x1 = jStat.min(income);
      x2 = jStat.max(income);
      y1 = a + b * x1;
      y2 = a + b * x2;
      return {
        line: [
          [x1, y1],
          [x2, y2]
        ],
        r
      };
    }

  //set chart data to a certain category
  function setCrime(category) {

    //reinitialise empty array for chart points
    chartdata = [];

    //initialise empty arrays for holding regression data
    regdata = [];
    catArray = [];
    incArray = [];
    
    console.log(category);

    for(var i = 0; i < data.length; i++) {
      //location quotient for crime category
      var cat = parseFloat(data[i][category]);
      //annual income in 2018
      var inc = parseFloat(data[i]['Total_yearly_income_2018']);

      chartdata.push({x: inc, y: cat, z: parseFloat(data[i]['Total_crime']), name: data[i]['MSOA_name']});
      catArray.push(cat);
      incArray.push(inc);
    }

    //UPDATE POINTS
    //console.log(chartdata);
    chart.series[0].setData(chartdata);

    console.log(chart.yAxis[0].options.plotLines[0].label);


    //UPDATE REGRESSION LINE
    var regObj = regression(catArray, incArray);
    //console.log(regObj); 
    regdata = regObj['line']; //array of two points on line
    r = regObj['r']; //correlation coefficient of line

    //add line to chart
    chart.series[1].setData(regdata);  

    //view correlation coefficient when you hover over the line
    chart.series[1].update({
      tooltip: {
        pointFormat: '<b>Correlation coefficient</b>: ' + r.toFixed(2)
      }
    });

    //UPDATE PLOT LINE TEXT
    chart.yAxis[0].options.plotLines[0].label.text = 'Citywide share of crimes classified under ' + category;
    chart.yAxis[0].update();
  }

  //set initial view to violent crime
  setCrime('Violence Against the Person');

  //set the crime category with a button
  const buttons = document.getElementsByTagName("input");

  Array.from(buttons).forEach(button =>
  button.addEventListener("click", crimeListener));

  function crimeListener(event) { 
    //change which element has the active class
    var current = document.getElementsByClassName("active"); 
    current[0].className = current[0].className.replace(" active", "");
    const button = event.target;
    button.className += " active";

    //call setCrime function using button value
    setCrime(button.value);
  }

});