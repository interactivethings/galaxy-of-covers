// setup
static final void
main(String[] args) {
  String sketch = Thread.currentThread()
    .getStackTrace()[1].getClassName();
 
  main(sketch, args
    , "--display=1"
//    , "--full-screen"
    );
}
 
static final void
main(String name, String[] oldArgs, String... newArgs) {
  runSketch(concat(append(newArgs, name), oldArgs), null);
}

void setup() {

}

public int sketchWidth() {
  return 1000;
}

public int sketchHeight() {
  return 1000;
}

public String sketchRenderer() {
  return P3D;
}

void draw() {
  background(255);
}
