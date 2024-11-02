---
title: Generic, Covariant, Invariant , Contravariant
date: 2024-11-02
comments: true
categories:
  - posts
tags:
  - generic
  - covariant
  - invariant
  - contravariant
  - coding
---

## 제네릭(Generic)이란?
제네릭은 쉽게 말해서 "타입을 파라미터로 받는 것"입니다. 마치 함수가 인자를 받듯이, 클래스가 타입을 인자로 받는 겁니다.

<br>

## 왜 제네릭을 사용할까?
간단한 예시로 설명해보겠습니다:
  

### 제네릭을 사용하지 않은 경우
```java
// 제네릭을 사용하지 않은 경우
class OldBox {
    private Object item;
    
    public void setItem(Object item) {
        this.item = item;
    }
    
    public Object getItem() {
        return item;
    }
}

```

<br>

### 제네릭을 사용한 경우
```java

// 사용할 때
OldBox box = new OldBox();
box.setItem("Hello");  // String을 넣었는데
Integer number = (Integer) box.getItem();  // Integer로 꺼내려고 하면 런타임 에러!

// 제네릭을 사용한 경우
class Box<T> {
    private T item;
    
    public void setItem(T item) {
        this.item = item;
    }
    
    public T getItem() {
        return item;
    }
}

// 사용할 때
Box<String> box = new Box<>();
box.setItem("Hello");  // String만 넣을 수 있음
String text = box.getItem();  // 형변환 필요 없음
// box.setItem(123);  // 컴파일 에러! String만 넣을 수 있습니다.
```




### 제네릭의 장점

1. 타입을 잘못 사용하면 컴파일러가 바로 알려줍니다 (빨간 줄 생김❗️)

2. 형변환 코드를 안 써도 됩니다 (즉, 캐스팅 없이 사용 가능)

3. 같은 로직을 여러 타입에 사용할 수 있습니다


<br>

---

### 변성(Variance)이란?
동물원을 예시로 들어보겠습니다.

```java
class Animal { }
class Dog extends Animal { }
class Cat extends Animal { }
```

위와 같은 클래스가 있다고 가정해봅시다.

### 불변성(Invariant)

불변성을 가지는 클래스는 변성을 가지지 않습니다. 즉, 서로 다른 타입의 객체를 받을 수 없습니다.
```java
class Zoo<T> {
    private T animal;
    public void setAnimal(T animal) { this.animal = animal; }
    public T getAnimal() { return animal; }
}

// 사용할 때
Zoo<Dog> dogZoo = new Zoo<>();
// Zoo<Animal> animalZoo = dogZoo;  // 컴파일 에러!
Zoo<Cat> catZoo = new Zoo<>();
//// Zoo<Dog> animalZoo = catZoo; // 컴파일 에러!
```
위와 같은 경우가 가장 Strict한 경우입니다. DogZoo와 CatZoo는 서로 다른 타입이기 때문에 서로 할당할 수 없습니다
또한, Dog는 Animal의 하위 클래스 이지만, Zoo<Dog>는 Zoo<Animal>가 될 수 없습니다.

<br>

### 공변성(Covariant)

공변성을 가지는 클래스는 상위 클래스로 변환할 수 있습니다.
먼저 코틀린을 예시로 들어보겠습니다.
```kotlin
// Kotlin의 경우
class AnimalShelter<out T> {
  private val animals: List<T> = listOf()
  fun getAnimal(): T = animals[0]
  // fun setAnimal(animal: T) {} // 컴파일 에러! out 타입은 리턴만 가능
}
```
<br>

다음은 Java로 작성한 코드입니다.
```java
// Java의 경우
class AnimalShelter<T> {
    private List<T> animals = new ArrayList<>();
    public T getAnimal() { return animals.get(0); }
}

// 사용할 때
AnimalShelter<Dog> dogShelter = new AnimalShelter<>();
AnimalShelter<? extends Animal> animalShelter = dogShelter;  // OK!
```
읽기 전용일 때 공변성을 사용할 수 있습니다. Dog가 Animal의 하위 클래스이기 때문에 DogShelter를 AnimalShelter로 변환할 수 있습니다.

<br>

### 반공변성(Contravariant)

반공변성을 가지는 클래스는 하위 클래스로 변환할 수 있습니다.
먼저 코틀린을 예시로 들어보겠습니다.
```kotlin
// Kotlin의 경우
class AnimalCage<in T> {
    fun putAnimal(animal: T) {}
    // fun getAnimal(): T {} // 컴파일 에러! in 타입은 매개변수로만 가능
}
```

<br>

다음은 Java로 작성한 코드입니다.

```java
// Java의 경우
class AnimalCage<T> {
    public void putAnimal(T animal) {}
}

// 사용할 때
AnimalCage<Animal> animalCage = new AnimalCage<>();
AnimalCage<? super Dog> dogCage = animalCage;  // OK!
```

쓰기 전용일 때 반공변성을 사용할 수 있습니다. Dog가 Animal이면, Cage<Animal>이 Cage<Dog>가 될 수 있음을 의미합니다. 

<br>

---
자바에서 사용되는 실제 예시를 들어보겠습니다.

```java
// Producer (공변성) - 데이터를 제공하는 클래스
interface FruitBasket<T> {
    T getFruit();  // 과일을 꺼내기만 함
}

// Consumer (반공변성) - 데이터를 소비하는 클래스
interface FruitProcessor<T> {
    void processFruit(T fruit);  // 과일을 처리만 함
}

// 불변성 - 둘 다 하는 클래스
interface FruitStore<T> {
    T getFruit();  // 과일도 꺼내고
    void addFruit(T fruit);  // 과일도 넣음
}
```

<br>

---

## 결론

제네릭은 "타입을 파라미터로 받는 것"입니다. 그리고 변성은 제네릭 타입 간의 관계를 정의합니다:
- 불변성: 정확히 그 타입만 (가장 엄격)
- 공변성: 값을 꺼낼 때 (리턴 타입) (하위 클래스로 변환 가능)
- 반공변성: 값을 넣을 때 (매개변수 타입) (상위 클래스로 변환 가능)

