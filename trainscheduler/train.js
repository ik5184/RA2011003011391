export default async function handler(req, res) {
    // todo: only auth when needed
    var auth = null;
    var company = null;
    if (auth == null) {
      if (company == null) {
        const options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: '{"companyName":"company"}',
        };
  
        await fetch("http://localhost:5000/register", options)
          .then((response) => response.json())
          .then((response) => (company = response))
          .catch((err) => console.error(err));
      }
  
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{"companyName":"company","clientID":"${company.clientID}","clientSecret":"${company.clientSecret}"}`,
      };
      await fetch("http://localhost:5000/auth", options)
        .then((response) => response.json())
        .then((response) => (auth = response))
        .catch((err) => console.error(err));
    }
  
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
      },
    };
  
    let data = [];
  
    await fetch("http://localhost:5000/trains", options)
      .then((response) => response.json())
      .then((response) => (data = response))
      .catch((err) => console.error(err));
  
    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
  
    let currTime = hour * 3600 + minute * 60 + second;
    data = data.filter((el) => {
      let trainDepTime =
        el.departureTime.Hours * 3600 +
        el.departureTime.Minutes * 60 +
        el.departureTime.Seconds +
        el.delayedBy * 60;
  
      if (trainDepTime < currTime) {
        trainDepTime += 12 * 3600;
      }
      if (Math.abs(trainDepTime - currTime) < 1800) {
        return false;
      }
  
      return true;
    });
  
    // console.log(data);
    data.sort((a, b) => {
      if (
        (a.price.sleeper < b.price.sleeper && a.price.AC < b.price.AC) ||
        (a.price.sleeper > b.price.sleeper && a.price.AC > b.price.AC)
      ) {
        return a.price.sleeper < b.price.sleeper && a.price.AC < b.price.AC;
      }
  
      if (
        a.seatsAvailable.sleeper + a.seatsAvailable.AC !=
        b.seatsAvailable.sleeper + b.seatsAvailable.AC
      ) {
        return (
          a.seatsAvailable.sleeper + a.seatsAvailable.AC >
          b.seatsAvailable.sleeper + b.seatsAvailable.AC
        );
      }
      let trainADepTime =
        a.departureTime.Hours * 3600 +
        a.departureTime.Minutes * 60 +
        a.departureTime.Seconds +
        a.delayedBy * 60;
  
      let trainBDepTime =
        b.departureTime.Hours * 3600 +
        b.departureTime.Minutes * 60 +
        b.departureTime.Seconds +
        b.delayedBy * 60;
  
      return trainADepTime >= trainBDepTime;
    });
  
    res.status(200).json(data);
  }
  