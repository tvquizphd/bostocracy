### bostocracy

Existing users are:

- username `a` password `a`

Two test events are hard-coded in the client.
Adding other events will be reflected as well.

### Dependencies

```
python3 -m venv u
source u/bin/activate
pip install -r requirements.txt
```

### Migrate

```
bash update_db.sh
```

or

```
bash reset_db.sh
```

### API Key

- For grading purposes only, I have included an API key in `.env`.
- Otherwise, get an [MBTA API Key](https://api-v3.mbta.com/register) and make a `.env` like so

```
MBTA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Run server

```
bash run.sh
```
